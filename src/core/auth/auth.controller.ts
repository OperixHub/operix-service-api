import type { Request, Response } from 'express';
import AuthService from './auth.service.js';
import ResponseHandler from '../../core/utils/response-handler.js';
import jwt from 'jsonwebtoken';
import UserModel from '../../modules/organization/users/users.model.js';

export default class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login(username, password);

      const decoded: any = jwt.decode((data as any).access_token);

      return ResponseHandler.success(res, {
        token: (data as any).access_token,
        refresh_token: (data as any).refresh_token,
        user: {
          id: decoded?.sub,
          username: decoded?.preferred_username || username,
          email: decoded?.email,
          tenant_id: decoded?.tenant_id ? Number(decoded.tenant_id) : 1
        }
      }, 'Login realizado com sucesso.');
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || 'Erro no login.', 401);
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const user = UserModel.fromRequest(req.body);
      const data = await AuthService.register(user);
      return ResponseHandler.success(res, data, 'Usuário cadastrado com sucesso!', 201);
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || 'Erro ao registrar.', 400);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    const { refresh_token } = req.body;
    try {
      const data = await AuthService.refreshToken(refresh_token);
      return ResponseHandler.success(res, data, 'Refresh token realizado com sucesso!', 200);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Refresh token inválido ou expirado', 401);
    }
  }
}
