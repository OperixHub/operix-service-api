import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import ResponseHandler from '../utils/response-handler.js';
import connection from '../database/connection.js';

const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI || `http://localhost:8080/realms/${process.env.KEYCLOAK_REALM || 'operixauth'}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600_000, // 10 minutes
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return callback(err, null);
    callback(null, key.getPublicKey());
  });
}

async function provisionUser(decoded: any): Promise<any> {
  const keycloakId = decoded.sub;
  const email = decoded.email || decoded.preferred_username || decoded.sub;
  const username = decoded.preferred_username || decoded.email || decoded.sub;
  const tenantId = decoded.tenant_id ? Number(decoded.tenant_id) : 1;

  const connect = await connection.connect();
  try {
    // Tenta por keycloak_id primeiro (mais confiável após migration)
    const byKcId = await connect.query(
      'SELECT * FROM users WHERE keycloak_id = $1',
      [keycloakId]
    );
    if (byKcId.rows.length > 0) return byKcId.rows[0];

    // Fallback por email
    const byEmail = await connect.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (byEmail.rows.length > 0) {
      // Atualiza o keycloak_id se ainda não estava preenchido
      await connect.query(
        'UPDATE users SET keycloak_id = $1 WHERE id = $2',
        [keycloakId, byEmail.rows[0].id]
      );
      return { ...byEmail.rows[0], keycloak_id: keycloakId };
    }

    // Provisiona novo usuário (auto-register SSO)
    const result = await connect.query(
      `INSERT INTO users (tenant_id, username, email, keycloak_id, root, admin)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tenantId, username, email, keycloakId, false, false]
    );
    return result.rows[0];
  } finally {
    connect.release();
  }
}

export default class AuthMiddleware {
  static async verifyRawToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {}, async (err: any, decoded: any) => {
        if (err) return reject(new Error('Token Keycloak inválido'));

        try {
          const user = await provisionUser(decoded);
          const roles: string[] = decoded.realm_access?.roles || [];

          resolve({
            ...user,
            sub: decoded.sub,
            roles,
            tenant_id: decoded.tenant_id ? Number(decoded.tenant_id) : user.tenant_id,
          });
        } catch (dbError) {
          reject(dbError);
        }
      });
    });
  }

  static async authToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return ResponseHandler.error(res, 'Acesso Negado!', 401);

    try {
      const user = await AuthMiddleware.verifyRawToken(token);
      (req as any).user = user;
      next();
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Token inválido', 401);
    }
  }
}
