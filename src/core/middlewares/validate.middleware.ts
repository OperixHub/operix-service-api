import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import ResponseHandler from '../utils/response-handler.js';

export default class ValidateMiddleware {
  static validateSchema<T>(schema: ZodSchema<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        const issues = result.error.issues
          .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
          .join('; ');

        return ResponseHandler.error(res, `Dados invÃ¡lidos: ${issues}`, 400);
      }

      req.body = result.data;
      next();
    };
  }
}
