import type { Request, Response } from 'express';
import ResponseHandler from '../../utils/response-handler.js';
import PermissionsService from './permissions.service.js';

export default class PermissionsController {
  static async getCatalog(_req: Request, res: Response) {
    return ResponseHandler.success(res, PermissionsService.getCatalog(), 'Catálogo de permissões obtido com sucesso');
  }

  static async getMe(req: Request, res: Response) {
    const snapshot = await PermissionsService.getCurrentUserPermissions((req as any).user);
    return ResponseHandler.success(res, {
      roles: (req as any).user?.roles || [],
      effective_permissions: snapshot.effective_permissions,
      permissions: snapshot.permissions,
    }, 'Permissões do usuário autenticado obtidas com sucesso');
  }

  static async getUser(req: Request, res: Response) {
    const data = await PermissionsService.getUserPermissionsForManagement(Number(req.params.id), (req as any).user);
    return ResponseHandler.success(res, data, 'Permissões do usuário obtidas com sucesso');
  }

  static async replaceUserOverrides(req: Request, res: Response) {
    const data = await PermissionsService.replaceUserOverrides(
      Number(req.params.id),
      (req as any).user,
      req.body.overrides,
    );

    return ResponseHandler.success(res, data, 'Permissões do usuário atualizadas com sucesso');
  }
}
