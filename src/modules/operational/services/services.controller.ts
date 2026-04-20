import type { Request, Response } from 'express';
import ServicesService from './services.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';
import ServiceModel from './services.model.js';
import MessagingService from '../../../core/utils/messaging.service.js';

export default class ServicesController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const services = await ServicesService.getAll(tenant_id);
    return ResponseHandler.success(res, services, 'ServiÃ§os listados com sucesso');
  }

  static async getAllWharehouse(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const services = await ServicesService.getAllWharehouse(tenant_id);
    return ResponseHandler.success(res, services, 'ServiÃ§os do almoxerifado listados com sucesso');
  }

  static async create(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const serviceData = ServiceModel.fromRequest({ ...req.body, tenant_id });
    const created = await ServicesService.create(serviceData);
    MessagingService.notifyTenant(tenant_id, '@service/created', created);
    return ResponseHandler.success(res, created, 'ServiÃ§o criado com sucesso', 201);
  }

  static async updateWarehouse(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id, value } = req.params;
    const { typeTable } = req.body;
    const result = await ServicesService.updateWarehouse(id, tenant_id, value, typeTable);
    return ResponseHandler.success(res, result, 'Status do almoxerifado atualizado com sucesso');
  }

  static async updateInfoClient(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id } = req.params;
    const result = await ServicesService.updateInfoClient(id, tenant_id, req.body);
    return ResponseHandler.success(res, result, 'InformaÃ§Ãµes do cliente atualizadas com sucesso');
  }

  static async updateStatusService(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id, status } = req.params;
    const { typeTable } = req.body;
    const result = await ServicesService.updateStatusService(id, tenant_id, status, typeTable);
    MessagingService.notifyTenant(tenant_id, '@service/status_updated', { id, status, result });
    return ResponseHandler.success(res, result, 'Status do serviÃ§o atualizado com sucesso');
  }

  static async updateStatusPayment(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id, status } = req.params;
    const { typeTable } = req.body;
    const result = await ServicesService.updateStatusPayment(id, tenant_id, status, typeTable);
    MessagingService.notifyTenant(tenant_id, '@service/payment_updated', { id, status, result });
    return ResponseHandler.success(res, result, 'Status do pagamento atualizado com sucesso');
  }

  static async remove(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id, cod, typeTable } = req.params;
    const result = await ServicesService.remove(id, tenant_id, cod, typeTable);
    return ResponseHandler.success(res, result, 'ServiÃ§o removido com sucesso', 204);
  }
}
