import type { Request, Response } from 'express';
import StatusPaymentService from './status-payment.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';
import StatusPaymentModel from './status-payment.model.js';

export default class StatusPaymentController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await StatusPaymentService.getAll(tenant_id), 'Status de pagamento listados com sucesso');
  }

  static async create(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const statusData = StatusPaymentModel.fromRequest({ ...req.body, tenant_id });
    return ResponseHandler.success(res, await StatusPaymentService.create(statusData), 'Status de pagamento criado com sucesso', 201);
  }

  static async remove(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await StatusPaymentService.remove(req.params.id, tenant_id), 'Status de pagamento removido com sucesso', 204);
  }
}
