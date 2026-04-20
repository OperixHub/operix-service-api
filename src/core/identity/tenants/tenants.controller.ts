import type { Request, Response } from 'express';
import ResponseHandler from '../../utils/response-handler.js';
import TenantModel from './tenants.model.js';
import TenantsService from './tenants.service.js';

export default class TenantsController {
  static async getAll(_req: Request, res: Response) {
    return ResponseHandler.success(res, await TenantsService.getAll(), 'Unidades listadas com sucesso');
  }

  static async create(req: Request, res: Response) {
    const tenantData = TenantModel.fromRequest(req.body);
    const createdTenant = await TenantsService.create(tenantData);
    return ResponseHandler.success(res, createdTenant, 'Unidade criada com sucesso', 201);
  }

  static async remove(req: Request, res: Response) {
    await TenantsService.remove(Number(req.params.id));
    return ResponseHandler.success(res, null, 'Unidade removida com sucesso', 204);
  }
}
