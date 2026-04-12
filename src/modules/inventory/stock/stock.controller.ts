import type { Request, Response } from 'express';
import StockService from './stock.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';
import StockModel from './stock.model.js';
import MessagingService from '../../../core/utils/messaging.service.js';

export default class StockController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await StockService.getAll(tenant_id), 'Estoque listado com sucesso');
  }

  static async create(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const stockData = StockModel.fromRequest({ ...req.body, tenant_id });
    return ResponseHandler.success(res, await StockService.create(stockData), 'Item de estoque criado com sucesso', 201);
  }

  static async update(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id } = req.params;
    const updated = await StockService.update(id, tenant_id, req.body);
    if (updated && updated.quantity <= 5) {
      MessagingService.notifyTenant(tenant_id, '@stock/low_stock_alert', updated);
    }
    return ResponseHandler.success(res, updated, 'Item de estoque atualizado com sucesso');
  }

  static async remove(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await StockService.remove(req.params.id, tenant_id), 'Item de estoque removido com sucesso');
  }
}
