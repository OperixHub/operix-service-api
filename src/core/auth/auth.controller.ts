import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AuthService from './auth.service.js';
import ResponseHandler from '../utils/response-handler.js';
import UsersRepository from '../profile/users/users.repository.js';
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
          sub: decoded?.sub || localUser?.keycloak_id || null,
          name: localUser?.name || decoded?.name || decoded?.preferred_username || username,
          username: decoded?.preferred_username || username,
          email: decoded?.email || localUser?.email || null,
          tenant_id: localUser?.tenant_id ?? (decoded?.tenant_id ? Number(decoded.tenant_id) : null),
          keycloak_id: localUser?.keycloak_id || decoded?.sub || null,
          admin: Boolean(localUser?.admin || roles.includes('admin') || roles.includes('ADMIN')),
          roles,
        },
      }, 'Login realizado com sucesso.');
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Erro no login.', 401);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const data = await AuthService.refreshToken(req.body.refresh_token);
      return ResponseHandler.success(res, data, 'Refresh token realizado com sucesso!', 200);
    } catch (error: any) {
      return ResponseHandler.error(res, error.message || 'Refresh token inválido ou expirado', 401);
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
