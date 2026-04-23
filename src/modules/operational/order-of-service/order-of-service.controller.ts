import type { Request, Response } from 'express';
import OrderOfServiceService from './order-of-service.service.js';
import Utils from '../../../core/utils/utils.js';
import ResponseHandler from '../../../core/utils/response-handler.js';

export default class OrderOfServiceController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const orders = await OrderOfServiceService.getAll(tenant_id);
    return ResponseHandler.success(res, orders, 'Ordens de serviço listadas com sucesso');
  }

  static async getUnique(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { cod } = req.params;
    const order = await OrderOfServiceService.getUnique(cod, tenant_id);
    return ResponseHandler.success(res, order, 'Ordem de serviço detalhada com sucesso');
  }

  static async updateEstimate(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { cod } = req.params;

    if (req.body.type === 'completa') {
      const getOrderValue = await OrderOfServiceService.getUnique(cod, tenant_id);
      const id = Utils.generateUuid();
      const estimateArray = JSON.parse(getOrderValue[0].estimate) || [];
      estimateArray.push({ id, amount: req.body.amount, description: req.body.description, price: req.body.price });
      let totalPrice = 0;
      for (const record of estimateArray) totalPrice += record.price;
      const updated = await OrderOfServiceService.updateEstimate(JSON.stringify(estimateArray), totalPrice, cod, tenant_id);
      return ResponseHandler.success(res, updated, 'Orçamento atualizado com sucesso');
    } else {
      const removed = await OrderOfServiceService.removeEstimateSimple(cod, tenant_id);
      if (removed) {
        const getOrderValue = await OrderOfServiceService.getUnique(cod, tenant_id);
        const id = Utils.generateUuid();
        const estimateArray = JSON.parse(getOrderValue[0].estimate) || [];
        estimateArray.push({ id, amount: req.body.amount, description: req.body.description, price: req.body.price });
        let totalPrice = 0;
        for (const record of estimateArray) totalPrice += record.price;
        const updated = await OrderOfServiceService.updateEstimate(JSON.stringify(estimateArray), totalPrice, cod, tenant_id);
        return ResponseHandler.success(res, updated, 'Orçamento simplificado atualizado com sucesso');
      }
      return ResponseHandler.error(res, 'Erro ao atualizar orçamento simplificado', 422);
    }
  }

  static async removeEstimate(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { cod, idEstimate } = req.params;
    const result = await OrderOfServiceService.removeEstimate(cod, tenant_id, idEstimate);
    return ResponseHandler.success(res, result, 'Orçamento removido com sucesso', 204);
  }
}
