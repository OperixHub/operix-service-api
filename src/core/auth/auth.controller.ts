import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AuthService from './auth.service.js';
import ResponseHandler from '../utils/response-handler.js';
import UserModel from '../identity/users/users.model.js';
import UsersRepository from '../identity/users/users.repository.js';
import { sanitizeUser } from '../utils/sanitize.js';

export default class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login(username, password);

      const decoded: any = jwt.decode((data as any).access_token);
      const localUserByKeycloakId = await UsersRepository.findByKeycloakId(decoded?.sub);
      const localUserByEmail = decoded?.email ? await UsersRepository.findByEmail(decoded.email) : null;
      const localUser = localUserByKeycloakId || localUserByEmail;

      const roles: string[] = decoded?.realm_access?.roles || [];

      return ResponseHandler.success(res, {
        token: (data as any).access_token,
        refresh_token: (data as any).refresh_token,
        user: {
          id: localUser?.id || decoded?.sub,
          name: localUser?.name || decoded?.name || decoded?.preferred_username || username,
          username: decoded?.preferred_username || username,
          email: decoded?.email || localUser?.email || null,
          tenant_id: localUser?.tenant_id ?? (decoded?.tenant_id ? Number(decoded.tenant_id) : null),
          admin: Boolean(localUser?.admin || roles.includes('admin') || roles.includes('ADMIN')),
          roles,
        },
      }, 'Login realizado com sucesso.');
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro no login.', 401);
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const user = UserModel.fromRequest(req.body);
      const data = await AuthService.register(user);
      return ResponseHandler.success(res, sanitizeUser(data), 'UsuÃ¡rio cadastrado com sucesso!', 201);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro ao registrar.', error.status || 400);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const data = await AuthService.refreshToken(req.body.refresh_token);
      return ResponseHandler.success(res, data, 'Refresh token realizado com sucesso!', 200);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Refresh token invÃ¡lido ou expirado', 401);
    }
  }
}
