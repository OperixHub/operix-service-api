import ValidationError from '../../utils/validation-error.js';
import type UserModel from './users.model.js';
import UsersRepository from './users.repository.js';
import TenantsRepository from '../tenants/tenants.repository.js';
import KeycloakAdminService from '../../auth/keycloak-admin.service.js';
import { getRoleKeyForModule } from '../permissions/permissions.catalog.js';
import { sanitizeUser } from '../../utils/sanitize.js';

export default class UsersService {
  static async getAll(tenantId: number) {
    return UsersRepository.getAll(tenantId);
  }

  static async create(
    user: UserModel,
    actor: { tenant_id?: number | null },
    moduleKeys: string[] = [],
  ) {
    if (!actor.tenant_id) {
      throw new ValidationError('Tenant do usuário autenticado não encontrado.', 422);
    }

    const tenant = await TenantsRepository.findById(actor.tenant_id);
    if (!tenant) {
      throw new ValidationError('Unidade do usuário autenticado não encontrada.', 404);
    }

    const safeName = user.name.trim();
    const names = safeName.split(/\s+/).filter(Boolean);
    const firstName = names[0] || user.username;
    const lastName = names.slice(1).join(' ') || firstName;
    const adminToken = await KeycloakAdminService.getAdminToken();
    const { groupId } = tenant.keycloak_group_id
      ? { groupId: tenant.keycloak_group_id }
      : await KeycloakAdminService.ensureGroupExists(tenant.name, adminToken);
    const roleKeys = this.resolveRoleKeys(Boolean(user.admin), moduleKeys);

    let keycloakId: string | null = null;

    try {
      keycloakId = await KeycloakAdminService.createUser({
        username: user.username,
        email: user.email,
        firstName,
        lastName,
        password: user.password || '',
        attributes: {
          admin: [String(Boolean(user.admin))],
          root: [String(Boolean(user.root))],
          tenant: [tenant.name],
          tenant_id: [String(tenant.id)],
        },
      }, adminToken);

      await KeycloakAdminService.addUserToGroup(keycloakId, groupId, adminToken);
      await KeycloakAdminService.assignRealmRoles(keycloakId, roleKeys, adminToken);

      const persistedUser = await UsersRepository.create({
        ...user,
        tenant: tenant.name,
        tenant_id: tenant.id,
        keycloak_id: keycloakId,
        password: null,
      } as UserModel);

      await KeycloakAdminService.updateUserAttributes(keycloakId, {
        admin: [String(Boolean(persistedUser.admin))],
        root: [String(Boolean(persistedUser.root))],
        tenant: [tenant.name],
        tenant_id: [String(tenant.id)],
      }, adminToken);

      return sanitizeUser(persistedUser);
    } catch (error) {
      if (keycloakId) {
        await KeycloakAdminService.deleteUser(keycloakId, adminToken);
      }

      throw error;
    }
  }

  static async remove(user: UserModel, tenantId: number) {
    const result = await UsersRepository.getById(user, tenantId);

    if (!result || result.length === 0) {
      throw new ValidationError('Usuário não encontrado.', 404);
    }

    if (result[0].admin === true) {
      throw new ValidationError('Usuário administrador não pode ser removido.', 422);
    }

    if (result[0].keycloak_id) {
      const adminToken = await KeycloakAdminService.getAdminToken();
      await KeycloakAdminService.deleteUser(result[0].keycloak_id, adminToken);
    }

    return UsersRepository.remove(user, tenantId);
  }

  private static resolveRoleKeys(isAdmin: boolean, moduleKeys: string[]) {
    const normalizedModuleKeys = (isAdmin && moduleKeys.length === 0)
      ? ['operational', 'inventory', 'organization', 'notifications']
      : moduleKeys;

    return [...new Set(
      normalizedModuleKeys
        .map((moduleKey) => getRoleKeyForModule(moduleKey))
        .filter((roleKey): roleKey is string => Boolean(roleKey)),
    )];
  }
}
