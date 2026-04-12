import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import ResponseHandler from '../utils/response-handler.js';
import connection from '../database/connection.js';
import UsersRepository from '../identity/users/users.repository.js';
import UserModel from '../identity/users/users.model.js';

const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI || `http://localhost:8080/realms/${process.env.KEYCLOAK_REALM || 'operix-service'}/protocol/openid-connect/certs`,
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
      console.error(`Erro ao obter chave JWKS para kid=${header.kid}:`, err);
      return callback(err);
    }
    if (!key) {
      return callback(new Error(`Nenhuma chave encontrada para kid=${header.kid}`));
    }
    try {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    } catch (e) {
      callback(e as Error);
    }
  });
}

const jwtVerifyOptions = {
  algorithms: ['RS256'] as jwt.Algorithm[],
  issuer: process.env.KEYCLOAK_ISSUER || `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM || 'operix-service'}`,
};

async function provisionUser(decoded: any): Promise<any> {
  const keycloakId = decoded.sub;
  const email = decoded.email || decoded.preferred_username || decoded.sub;
  const username = decoded.username || decoded.preferred_username || decoded.email || decoded.sub;

  try {
    const byKcId = await UsersRepository.findByKeycloakId(keycloakId);
    if (byKcId) return byKcId;

    const byEmail = await UsersRepository.findByEmail(email);
    if (byEmail) {
      // Link as contas se o email bater
      const connect = await connection.connect();
      try {
        await connect.query('UPDATE users SET keycloak_id = $1 WHERE id = $2', [keycloakId, byEmail.id]);
      } finally {
        connect.release();
      }
      return { ...byEmail, keycloak_id: keycloakId };
    }

    // Provisionamento Automático (Caso não exista e seja login SSO válido)
    const tenantId = decoded.tenant_id ? Number(decoded.tenant_id) : 1;
    const name = decoded.name || username;

    const newUser = new UserModel({
      tenant_id: tenantId,
      name,
      username,
      email,
      keycloak_id: keycloakId,
      root: false,
      admin: false
    });

    return await UsersRepository.create(newUser);
  } catch (error) {
    console.error('Erro ao provisionar usuário:', error);
    return null;
  }
}

export default class AuthMiddleware {
  static async verifyRawToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, getKey, jwtVerifyOptions, async (err: any, decoded: any) => {

        if (err) {
          return reject(new Error(`Token inválido: ${err.message}`));
        }

        try {
          const user = await provisionUser(decoded);
          const roles: string[] = decoded.realm_access?.roles || [];

          if (!user) {
            // Fallback se o provisionamento falhou
            return resolve({
              id: null,
              keycloak_id: decoded.sub,
              username: decoded.preferred_username || decoded.sub,
              email: decoded.email,
              roles,
              tenant_id: decoded.tenant_id ? Number(decoded.tenant_id) : 1,
            });
          }

          resolve({
            ...user,
            sub: decoded.sub,
            roles,
            tenant_id: decoded.tenant_id ? Number(decoded.tenant_id) : user.tenant_id,
          });
        } catch (dbError) {
          reject(new Error(`Erro ao provisionar usuário no banco:: ${dbError}`));
        }
      })
    });
  }

  static async authToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return ResponseHandler.error(res, 'Token de acesso não fornecido', 401);
    }

    try {
      const user = await AuthMiddleware.verifyRawToken(token);
      (req as any).user = user;
      next();
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Falha na autenticação', 401);
    }
  }
}