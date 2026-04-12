import type { Request, Response, NextFunction, RequestHandler } from 'express';
import ResponseHandler from '../utils/response-handler.js';

export default class RolesMiddleware {
  /**
   * Exige que o usuário autenticado possua TODAS as roles listadas.
   */
  static requireRole(...requiredRoles: string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRoles: string[] = (req as any).user?.roles || [];

      console.log('userRoles', userRoles)
      console.log('requiredRoles', requiredRoles)
      const hasAll = requiredRoles.every(role => userRoles.includes(role));
      console.log('hasAll', hasAll)
      if (!hasAll) {
        return ResponseHandler.error(
          res,
          `Acesso negado. Role(s) necessária(s): ${requiredRoles.join(', ')}`,
          403
        );
      }
      next();
    };
  }

  /**
   * Exige que o usuário autenticado possua PELO MENOS UMA das roles listadas.
   */
  static requireAnyRole(...requiredRoles: string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRoles: string[] = (req as any).user?.roles || [];

      const hasAny = requiredRoles.some(role => userRoles.includes(role));
      if (!hasAny) {
        return ResponseHandler.error(
          res,
          `Acesso negado. É necessária pelo menos uma das roles: ${requiredRoles.join(', ')}`,
          403
        );
      }
      next();
    };
  }
}
