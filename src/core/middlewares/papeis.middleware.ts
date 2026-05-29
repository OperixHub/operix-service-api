import type { NextFunction, Request, RequestHandler, Response } from 'express';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

export default class PapeisMiddleware {
  static exigirPapel(...requiredRoles: string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRoles: string[] = (req as any).user?.roles || [];
      const hasAll = requiredRoles.every((role) => userRoles.includes(role));

      if (!hasAll) {
        return ManipuladorResposta.erro(
          res,
          `Acesso negado. Role(s) necessária(s): ${requiredRoles.join(', ')}`,
          403,
        );
      }

      next();
    };
  }

  static exigirQualquerPapel(...requiredRoles: string[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRoles: string[] = (req as any).user?.roles || [];
      const hasAny = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasAny) {
        return ManipuladorResposta.erro(
          res,
          `Acesso negado. É necessária pelo menos uma das roles: ${requiredRoles.join(', ')}`,
          403,
        );
      }

      next();
    };
  }
}
