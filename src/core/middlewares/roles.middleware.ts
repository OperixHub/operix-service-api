import type { NextFunction, Request, RequestHandler, Response } from 'express';
import ResponseHandler from '../utils/response-handler.js';

export default class RolesMiddleware {
  static requireRole(...requiredRoles: string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRoles: string[] = (req as any).user?.roles || [];
      const hasAll = requiredRoles.every((role) => userRoles.includes(role));

      if (!hasAll) {
        return ResponseHandler.error(
          res,
          `Acesso negado. Role(s) necessÃ¡ria(s): ${requiredRoles.join(', ')}`,
          403,
        );
      }

      next();
    };
  }

  static requireAnyRole(...requiredRoles: string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRoles: string[] = (req as any).user?.roles || [];
      const hasAny = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasAny) {
        return ResponseHandler.error(
          res,
          `Acesso negado. Ã‰ necessÃ¡ria pelo menos uma das roles: ${requiredRoles.join(', ')}`,
          403,
        );
      }

      next();
    };
  }
}
