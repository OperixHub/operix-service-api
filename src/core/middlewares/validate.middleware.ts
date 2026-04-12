import type { ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../utils/response-handler.js';

export default class ValidateMiddleware {
  static validateSchema(schema: ZodSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      schema.parseAsync(req.body)
        .then((data) => {
          req.body = data;
          next();
        })
        .catch((error) => {
          return ResponseHandler.error(res, 'Dados inválidos: ' + error.message, 400);
        });
    };
  }
}
