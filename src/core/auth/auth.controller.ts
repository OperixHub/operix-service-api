import type { Request, Response } from 'express';
import AuthService from './auth.service.js';
import ResponseHandler from '../utils/response-handler.js';
import { sanitizeUser } from '../utils/sanitize.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import PermissionsService from '../profile/permissions/permissions.service.js';

export default class AuthController {
  static async config(_req: Request, res: Response) {
    try {
      const data = await AuthService.getPublicConfig();
      return ResponseHandler.success(res, data, 'Configuração de autenticação carregada.');
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro ao carregar configuração.', 500);
    }
  }

  static async authorize(req: Request, res: Response) {
    try {
      const authorization_url = AuthService.buildAuthorizationUrl({
        redirectUri: req.body.redirect_uri,
        state: req.body.state,
        codeChallenge: req.body.code_challenge,
        identityProvider: req.body.identity_provider || 'google',
      });

      return ResponseHandler.success(res, { authorization_url }, 'URL de autenticação gerada.');
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro ao iniciar autenticação.', 400);
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      const tokenData = await AuthService.exchangeAuthorizationCode(
        req.body.code,
        req.body.redirect_uri,
        req.body.code_verifier,
      );

      const user = await AuthMiddleware.verifyRawToken(tokenData.access_token);
      return ResponseHandler.success(res, AuthService.buildSessionPayload(tokenData, user), 'Login realizado com sucesso.');
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro ao finalizar login.', 401);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const data = await AuthService.login(username, password);
      const user = await AuthMiddleware.verifyRawToken((data as any).access_token);
      return ResponseHandler.success(res, AuthService.buildSessionPayload(data, user), 'Login realizado com sucesso.');
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro no login.', 401);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const data = await AuthService.refreshToken(req.body.refresh_token);
      const user = await AuthMiddleware.verifyRawToken((data as any).access_token);
      return ResponseHandler.success(res, AuthService.buildSessionPayload(data, user), 'Refresh token realizado com sucesso!', 200);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Refresh token inválido ou expirado', 401);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      await AuthService.logout(req.body.refresh_token);
      return ResponseHandler.success(res, null, 'Logout realizado com sucesso.', 200);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro ao realizar logout.', 400);
    }
  }

  static async me(req: Request, res: Response) {
    const snapshot = await PermissionsService.getCurrentUserPermissions((req as any).user);
    return ResponseHandler.success(res, {
      user: sanitizeUser((req as any).user),
      permissions: snapshot.effective_permissions,
      access: snapshot.access,
    }, 'Sessão carregada.');
  }

  static async completeOnboarding(req: Request, res: Response) {
    try {
      const data = await AuthService.completeOnboarding((req as any).user, req.body);
      return ResponseHandler.success(res, data, 'Onboarding concluído com sucesso.', 201);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro ao concluir onboarding.', error.status || 400);
    }
  }
}
