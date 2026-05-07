import type { Request, Response } from 'express';
import ResponseHandler from '../../utils/response-handler.js';
import UserModel from './users.model.js';
import UsersService from './users.service.js';

export default class UsersController {
  static async getAll(req: Request, res: Response) {
    const { tenant_id: tenantId } = (req as any).user;
    return ResponseHandler.success(res, await UsersService.getAll(tenantId), 'Usuários listados com sucesso');
  }

  static async create(req: Request, res: Response) {
    const createdUser = await UsersService.create(
      UserModel.fromRequest(req.body),
      (req as any).user,
      req.body.modules,
    );

    return ResponseHandler.success(res, createdUser, 'Usuário criado com sucesso', 201);
  }

  static async remove(req: Request, res: Response) {
    const { tenant_id: tenantId } = (req as any).user;
    const user = UserModel.fromRequestParams(req.params);
    await UsersService.remove(user, tenantId);
    return ResponseHandler.success(res, null, 'Usuário removido com sucesso', 204);
  }

  static async updateAccess(req: Request, res: Response) {
    const data = await UsersService.updateAccess(Number(req.params.id), (req as any).user, UserModel.fromRequest(req.body));
    return ResponseHandler.success(res, data, 'Usuário atualizado com sucesso');
  }
}
