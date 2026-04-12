import type { Request, Response } from 'express';
import TenantsService from './tenants.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';
import TenantModel from './tenants.model.js';

export default class TenantsController {
  static async getAll(req: Request, res: Response) {
    return ResponseHandler.success(res, await TenantsService.getAll(), 'Unidades listadas com sucesso');
  }

  static async create(req: Request, res: Response) {
    const tenantData = TenantModel.fromRequest(req.body);
    return ResponseHandler.success(res, await TenantsService.create(tenantData), 'Unidade criada com sucesso', 201);
  }

  static async remove(req: Request, res: Response) {
    return ResponseHandler.success(res, await TenantsService.remove(req.params.id), 'Unidade removida com sucesso', 204);
  }
}
