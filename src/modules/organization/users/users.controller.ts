import type { Request, Response } from 'express';
import UsersService from './users.service.js';
import UserModel from './users.model.js';
import ResponseHandler from '../../../core/utils/response-handler.js';

export default class UsersController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ResponseHandler.success(res, await UsersService.getAll(tenant_id), 'Usuários listados com sucesso');
  }

  static async remove(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const user = UserModel.fromRequestParams(req.params);
    return ResponseHandler.success(res, await UsersService.remove(user, tenant_id), 'Usuário removido com sucesso', 204);
  }
}
