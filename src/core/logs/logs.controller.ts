import type { Request, Response } from 'express';
import LogsService from '../logs/logs.service.js';
import ResponseHandler from '../utils/response-handler.js';

export default class LogsController {
  static async getPaginatedLogs(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await LogsService.getPaginatedLogs(tenant_id, page, limit);
    return ResponseHandler.success(res, logs, 'Logs listados com sucesso');
  }
}
