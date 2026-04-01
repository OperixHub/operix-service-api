import type { Request, Response, NextFunction } from "express";
import jwt, { type Secret } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import ResponseHandler from "../utils/ResponseHandler.js";
// @ts-ignore
import connection from "../database/connection.js";

const client = jwksClient({
  jwksUri: process.env.KEYCLOAK_JWKS_URI || "http://localhost:8080/realms/master/protocol/openid-connect/certs",
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err || !key) {
      return callback(err, null);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export default class AuthMiddleware {
  static async verifyRawToken(token: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const unverified = jwt.decode(token, { complete: true }) as any;
      if (!unverified) return reject(new Error("Token Inválido"));

      if (unverified.payload.iss && unverified.payload.iss.includes('realms')) {
        jwt.verify(token, getKey, {}, async (err: any, decoded: any) => {
          if (err) return reject(new Error("Token SSO Inválido"));
          
          const email = decoded.email || decoded.preferred_username || decoded.sub;
          const connect = await connection.connect();
          
          try {
            const { rows } = await connect.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, email]);
            let user;
            
            if (rows.length > 0) {
              user = rows[0];
            } else {
              const result = await connect.query(
                 "INSERT INTO users (tenant_id, username, email, password, root, admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                 [1, email, email, "sso-login", false, false]
              );
              user = result.rows[0];
            }
            resolve(user);
          } catch (dbError) {
            reject(dbError);
          } finally {
            connect.release();
          }
        });
      } else {
        try {
          const secret: Secret = process.env.SECRET as Secret;
          const decoded = jwt.verify(token, secret);
          resolve(decoded);
        } catch (error) {
          reject(new Error("Token Local Inválido"));
        }
      }
    });
  }

  static async authToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return ResponseHandler.error(res, "Acesso Negado!", 401);

    try {
      const user = await AuthMiddleware.verifyRawToken(token);
      (req as any).user = user;
      next();
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || "Acesso Negado", 401);
    }
  }
}
