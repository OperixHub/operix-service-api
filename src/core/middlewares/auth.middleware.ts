import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import ResponseHandler from '../utils/response-handler.js';
import connection from '../database/connection.js';
import UsersRepository from '../profile/users/users.repository.js';
import UserModel from '../profile/users/users.model.js';
import TenantRepository from '../profile/tenants/tenants.repository.js';
import { env } from '../config/env.js';

const client = jwksClient({
  jwksUri: env.keycloakJwksUri,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600_000,
});

function getKey(header: any, callback: jwt.SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('Token JWT não contém "kid" no header'));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }

    if (!key) {
      return callback(new Error(`Nenhuma chave encontrada para kid=${header.kid}`));
    }

    try {
      callback(null, key.getPublicKey());
    } catch (error) {
      callback(error as Error);
    }
  });
}

const validIssuers = [
  env.keycloakIssuer,
  `${env.keycloakPublicUrl}/realms/${env.keycloakRealm}`,
  `${env.keycloakUrl}/realms/${env.keycloakRealm}`
];

const jwtVerifyOptions = {
  algorithms: ['RS256'] as jwt.Algorithm[],
  issuer: Array.from(new Set(validIssuers)) as [string, ...string[]],
};

async function resolveTenantId(decoded: any, user?: { tenant_id?: number | null }) {
  if (user?.tenant_id) {
    return user.tenant_id;
  }

  if (decoded?.tenant_id) {
    const tenantId = Number(decoded.tenant_id);
    if (!Number.isNaN(tenantId)) {
      return tenantId;
    }
  }

  const groups = Array.isArray(decoded?.groups) ? decoded.groups : [];
  for (const groupName of groups) {
    const tenant = await TenantRepository.findByName(String(groupName));
    if (tenant?.id) {
      return tenant.id;
    }
  }

  return null;
}

async function provisionUser(decoded: any): Promise<any> {
  const keycloakId = decoded.sub;
  const email = decoded.email || decoded.preferred_username || decoded.sub;
  const username = decoded.preferred_username || decoded.username || decoded.email || decoded.sub;

  const byKcId = await UsersRepository.findByKeycloakId(keycloakId);
  if (byKcId) {
    return byKcId;
  }

  const byEmail = await UsersRepository.findByEmail(email);
  if (byEmail) {
    const connect = await connection.connect();
    try {
      await connect.query('UPDATE users SET keycloak_id = $1 WHERE id = $2', [keycloakId, byEmail.id]);
      return { ...byEmail, keycloak_id: keycloakId };
    } finally {
      connect.release();
    }
  }

  const tenantId = await resolveTenantId(decoded);
  if (!tenantId) {
    return {
      sub: keycloakId,
      keycloak_id: keycloakId,
      email,
      username,
      preferred_username: username,
      name: decoded.name || username,
      tenant_id: null,
      admin: false,
      root: false,
      onboarding_required: true,
    };
  }

  const name = decoded.name || username;
  return UsersRepository.create(new UserModel({
    tenant_id: tenantId,
    name,
    username,
    email,
    keycloak_id: keycloakId,
    root: false,
    admin: false,
    password: null,
  }));
}

export default class AuthMiddleware {
  private static normalizeAuthErrorMessage(error: unknown) {
    const rawMessage = error instanceof Error ? error.message : String(error || '');
    const normalized = rawMessage.toLowerCase();

    if (normalized.includes('jwt expired') || normalized.includes('token expired')) {
      return 'Token expirado';
    }

    return rawMessage || 'Falha na autenticação';
  }

  static async verifyRawToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, getKey, jwtVerifyOptions, async (err: any, decoded: any) => {
        if (err || err !== null) {
          return reject(new Error(`Token inválido: ${err?.message || err}`));
        }

        try {
          const user = await provisionUser(decoded);
          const roles: string[] = decoded.realm_access?.roles || [];

          resolve({
            ...user,
            sub: decoded.sub,
            email: user.email || decoded.email || null,
            username: user.username || decoded.preferred_username || decoded.username || decoded.email || decoded.sub,
            roles,
            tenant_id: await resolveTenantId(decoded, user),
            onboarding_required: !user?.tenant_id,
          });
        } catch (error: any) {
          reject(new Error(error.message || 'Erro ao provisionar usuário no banco.'));
        }
      });
    });
  }

  static async authToken(req: Request, res: Response, next: NextFunction) {
    console.log('Middleware', req)
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return ResponseHandler.error(res, 'Token de acesso não fornecido', 401);
    }

    try {
      (req as any).user = await AuthMiddleware.verifyRawToken(token);
      next();
    } catch (error: any) {
      return ResponseHandler.error(res, AuthMiddleware.normalizeAuthErrorMessage(error), 401);
    }
  }
}
