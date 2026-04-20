import type { Request, Response } from 'express';
import ToolsService from './tools.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';

export default class ToolsController {
  static async getNotifications(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await ToolsService.getNotifications(tenant_id), 'NotificaÃ§Ãµes obtidas com sucesso');
  }
}
