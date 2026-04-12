import type { Request, Response } from 'express';
import TypesProductService from './types-product.service.js';
import ResponseHandler from '../../../core/utils/response-handler.js';
import TypesProductModel from './types-product.model.js';

export default class TypesProductController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await TypesProductService.getAll(tenant_id), 'Tipos de produto listados com sucesso');
  }

  static async create(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const typeData = TypesProductModel.fromRequest({ ...req.body, tenant_id });
    return ResponseHandler.success(res, await TypesProductService.create(typeData), 'Tipo de produto criado com sucesso', 201);
  }

  static async remove(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await TypesProductService.remove(req.params.id, tenant_id), 'Tipo de produto removido com sucesso', 204);
  }
}
