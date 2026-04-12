import type { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../utils/response-handler.js';

export default class GlobalErrorHandler {
  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(`[Global Error Handler]: ${err.stack || err.message}`);
    const status = err.status || 500;
    const message = err.message || 'Ocorreu um erro interno no servidor.';
    return ResponseHandler.error(res, message, status);
  }
}
