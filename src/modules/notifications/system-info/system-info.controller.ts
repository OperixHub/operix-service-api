import type { Request, Response } from 'express';
import SystemInfoService from './system-info.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';

export default class SystemInfoController {
  static async getSystemInfo(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await SystemInfoService.getSystemInfo(tenant_id), 'Informações do sistema obtidas com sucesso');
  }
}
