import type { Request, Response } from 'express';
import ResponseHandler from '../utils/response-handler.js';
import PermissionsService from './permissions/permissions.service.js';
import TenantRepository from './tenants/tenants.repository.js';
import TenantsService from './tenants/tenants.service.js';
import TenantModel from './tenants/tenants.model.js';
import UsersService from './users/users.service.js';
import UserModel from './users/users.model.js';
import { sanitizeUser } from '../utils/sanitize.js';

export default class ProfileSettingsController {
  static async getMe(req: Request, res: Response) {
    return ResponseHandler.success(res, sanitizeUser((req as any).user), 'Perfil carregado com sucesso');
  }

  static async updateMe(req: Request, res: Response) {
    const data = await UsersService.updateOwnProfile((req as any).user, UserModel.fromRequest(req.body));
    return ResponseHandler.success(res, data, 'Perfil atualizado com sucesso');
  }

  static async getCompany(req: Request, res: Response) {
    const tenantId = (req as any).user?.tenant_id;
    const tenant = tenantId ? await TenantRepository.findById(tenantId) : null;
    return ResponseHandler.success(res, tenant, 'Empresa carregada com sucesso');
  }

  static async updateCompany(req: Request, res: Response) {
    const tenantId = (req as any).user?.tenant_id;
    const tenant = await TenantsService.update(tenantId, TenantModel.fromRequest(req.body));
    return ResponseHandler.success(res, tenant, 'Empresa atualizada com sucesso');
  }

  static async getSystem(req: Request, res: Response) {
    const snapshot = await PermissionsService.getCurrentUserPermissions((req as any).user);
    return ResponseHandler.success(res, {
      access: snapshot.access,
      effective_permissions: snapshot.effective_permissions,
      permissions: snapshot.permissions,
      catalog: PermissionsService.getCatalog(),
    }, 'Configurações do sistema carregadas com sucesso');
  }
}
