import type { NextFunction, Request, RequestHandler, Response } from 'express';
import ResponseHandler from '../utils/response-handler.js';
import PermissionsService from './permissions.service.js';

export default class PermissionsMiddleware {
  static requirePermission(permissionKey: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;

      if (!user) {
        return ResponseHandler.error(res, 'Usuário não autenticado.', 401);
      }

      try {
        if (!Array.isArray(user.permissions)) {
          const snapshot = await PermissionsService.getCurrentUserPermissions(user);
          user.permissions = snapshot.effective_permissions;
        }

        if (!PermissionsService.hasPermission(permissionKey, user.permissions)) {
          const definition = PermissionsService.getPermissionDefinition(permissionKey);
          const label = definition?.label || permissionKey;
          return ResponseHandler.error(res, `Acesso negado. Permissão necessária: ${label}`, 403);
        }

        next();
      } catch (error: any) {
        return ResponseHandler.error(res, error.message || 'Erro ao validar permissões.', 500);
      }
    };
  }

  static requireAdmin(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const isAdmin = Boolean(user?.admin || user?.root);

      if (!isAdmin) {
        return ResponseHandler.error(res, 'Acesso restrito a usuários administradores.', 403);
      }

      next();
    };
  }
}
