import type { Request, Response } from 'express';
import AuthService from './auth.service.js';
import ResponseHandler from '../../core/utils/response-handler.js';
import jwt from 'jsonwebtoken';

export default class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login(username, password);

      // Decoding token to send 'user' object in frontend standard schema
      const decoded: any = jwt.decode((data as any).access_token);

      return ResponseHandler.success(res, {
        token: (data as any).access_token,
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
      await AuthService.register(req.body);
      return ResponseHandler.success(res, null, 'Usuário cadastrado com sucesso!', 201);
    } catch (e: any) {
      return ResponseHandler.error(res, e.message || 'Erro ao registrar.', 400);
    }
  }
}
