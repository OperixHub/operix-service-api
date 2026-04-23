import ValidationError from '../../utils/validation-error.js';
import { sanitizeUser } from '../../utils/sanitize.js';
import UsersRepository from '../users/users.repository.js';
import KeycloakAdminService from '../../auth/keycloak-admin.service.js';
import PermissionsRepository from './permissions.repository.js';
import {
  getManageableModuleCatalog,
  getPermissionCatalog,
  getPermissionCatalogItem,
  getPermissionKeysForRoles,
  isPermissionKey,
} from './permissions.catalog.js';

type PermissionOverride = {
  permission_key: string;
  effect: 'allow' | 'deny';
};

type AuthenticatedUser = {
  id?: number | null;
  tenant_id?: number | null;
  roles?: string[];
  permissions?: string[];
  admin?: boolean | null;
  root?: boolean | null;
  name?: string | null;
  username?: string | null;
  email?: string | null;
};

export default class PermissionsService {
  static getCatalog() {
    const permissions = getPermissionCatalog();
    const modules = getManageableModuleCatalog().map((module) => ({
      ...module,
      permissions: permissions.filter((permission) => permission.module_key === module.key),
    }));

    return { modules, permissions };
  }

  static async getCurrentUserPermissions(user: AuthenticatedUser) {
    const overrides = user.id ? await PermissionsRepository.getOverridesByUserId(user.id) : [];
    return this.buildPermissionSnapshot({
      roles: user.roles || [],
      overrides,
    });
  }

  static async getUserPermissionsForManagement(targetUserId: number, actor: AuthenticatedUser) {
    if (!actor.tenant_id) {
      throw new ValidationError('Tenant do usuário autenticado não encontrado.', 422);
    }

    const targetUser = await UsersRepository.findByIdAndTenantId(targetUserId, actor.tenant_id);
    if (!targetUser) {
      throw new ValidationError('Usuário não encontrado.', 404);
    }

    const roles = targetUser.keycloak_id
      ? await KeycloakAdminService.getUserRealmRoleNames(targetUser.keycloak_id)
      : [];
    const overrides = await PermissionsRepository.getOverridesByUserId(targetUserId);
    const snapshot = this.buildPermissionSnapshot({ roles, overrides });

    return {
      user: sanitizeUser(targetUser),
      roles,
      module_roles: roles.filter((role) => role.startsWith('module:')),
      overrides,
      effective_permissions: snapshot.effective_permissions,
      permissions: snapshot.permissions,
    };
  }

  static async replaceUserOverrides(targetUserId: number, actor: AuthenticatedUser, overrides: PermissionOverride[]) {
    if (!actor.tenant_id) {
      throw new ValidationError('Tenant do usuário autenticado não encontrado.', 422);
    }

    const targetUser = await UsersRepository.findByIdAndTenantId(targetUserId, actor.tenant_id);
    if (!targetUser) {
      throw new ValidationError('Usuário não encontrado.', 404);
    }

    overrides.forEach((override) => {
      if (!isPermissionKey(override.permission_key)) {
        throw new ValidationError(`Permissão inválida: ${override.permission_key}`, 400);
      }
    });

    await PermissionsRepository.replaceOverrides(targetUserId, overrides);
    return this.getUserPermissionsForManagement(targetUserId, actor);
  }

  static buildPermissionSnapshot({
    roles = [],
    overrides = [],
  }: {
    roles?: string[];
    overrides?: PermissionOverride[];
  }) {
    const rolePermissions = new Set(getPermissionKeysForRoles(roles));
    const overrideMap = new Map(overrides.map((override) => [override.permission_key, override.effect]));

    const permissions = getPermissionCatalog().map((permission) => {
      const effect = overrideMap.get(permission.key);

      if (effect === 'deny') {
        return {
          ...permission,
          allowed: false,
          source: 'override:deny' as const,
        };
      }

      if (effect === 'allow') {
        return {
          ...permission,
          allowed: true,
          source: 'override:allow' as const,
        };
      }

      if (rolePermissions.has(permission.key)) {
        return {
          ...permission,
          allowed: true,
          source: permission.key === 'dashboard.access' ? ('authenticated' as const) : ('role' as const),
        };
      }

      return {
        ...permission,
        allowed: false,
        source: 'none' as const,
      };
    });

    return {
      effective_permissions: permissions.filter((permission) => permission.allowed).map((permission) => permission.key),
      permissions,
    };
  }

  static hasPermission(permissionKey: string, userPermissions: string[] = []) {
    return userPermissions.includes(permissionKey);
  }

  static getPermissionDefinition(permissionKey: string) {
    return getPermissionCatalogItem(permissionKey);
  }
}
