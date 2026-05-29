import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

export default class ValidacaoMiddleware {
  static validarSchema<T>(schema: ZodSchema<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        const issues = result.error.issues
          .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
          .join('; ');

        return ManipuladorResposta.erro(res, `Dados inválidos: ${issues}`, 400);
      }

      req.body = result.data;
      next();
    };
  }
}
