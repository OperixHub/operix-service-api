import type { Request, Response } from 'express';
import StatusServiceService from './status-service.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';
import StatusServiceModel from './status-service.model.js';

export default class StatusServiceController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await StatusServiceService.getAll(tenant_id), 'Status de serviço listados com sucesso');
  }

  static async create(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const statusData = StatusServiceModel.fromRequest({ ...req.body, tenant_id });
    return ResponseHandler.success(res, await StatusServiceService.create(statusData), 'Status de serviço criado com sucesso', 201);
  }

  static async remove(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await StatusServiceService.remove(req.params.id, tenant_id), 'Status de serviço removido com sucesso', 204);
  }
}
