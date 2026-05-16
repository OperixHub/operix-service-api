import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import ResponseHandler from '../utils/response-handler.js';
import connection from '../database/connection.js';
import UsersRepository from '../profile/users/users.repository.js';
import UserModel from '../profile/users/users.model.js';
import TenantRepository from '../profile/tenants/tenants.repository.js';
import { env } from '../config/env.js';

const jwksUris = Array.from(new Set([
  env.keycloakJwksUri,
  `${env.keycloakPublicUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/certs`,
  `${env.keycloakUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/certs`,
]));

function createJwksClient(jwksUri: string, cache: boolean) {
  return jwksClient({
    jwksUri,
    cache,
    cacheMaxEntries: 5,
    cacheMaxAge: 600_000,
  });
}

const cachedJwksClients = jwksUris.map((jwksUri) => createJwksClient(jwksUri, true));

function getSigningKeyFromClient(client: ReturnType<typeof jwksClient>, kid: string) {
  return new Promise<string>((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        reject(err);
        return;
      }

      if (!key) {
        reject(new Error(`Nenhuma chave encontrada para kid=${kid}`));
        return;
      }

      try {
        resolve(key.getPublicKey());
      } catch (error) {
        reject(error);
      }
    });
  });
}

function getKey(header: any, callback: jwt.SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('Token JWT não contém "kid" no header'));
  }

  (async () => {
    const errors: string[] = [];

    for (const client of cachedJwksClients) {
      try {
        const publicKey = await getSigningKeyFromClient(client, header.kid);
        callback(null, publicKey);
        return;
      } catch (error: any) {
        errors.push(error.message || String(error));
      }
    }

    for (const jwksUri of jwksUris) {
      try {
        const publicKey = await getSigningKeyFromClient(createJwksClient(jwksUri, false), header.kid);
        callback(null, publicKey);
        return;
      } catch (error: any) {
        errors.push(error.message || String(error));
      }
    }

    callback(new Error(`Nenhuma chave de assinatura encontrada para kid=${header.kid}. ${errors.join(' | ')}`));
  })().catch((error) => callback(error as Error));
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
  if (!keycloakId) {
    throw new Error('Token JWT não contém a claim obrigatória "sub"');
  }

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

    if (normalized.includes('unable to find a signing key') || normalized.includes('nenhuma chave de assinatura encontrada')) {
      return 'Token inválido para a instância atual do Keycloak. Faça login novamente.';
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
