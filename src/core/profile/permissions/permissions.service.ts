import ValidationError from '../../utils/validation-error.js';
import { sanitizeUser } from '../../utils/sanitize.js';
import UsersRepository from '../users/users.repository.js';
import KeycloakAdminService from '../../auth/keycloak-admin.service.js';
import PermissionsRepository from './permissions.repository.js';
import TenantRepository from '../tenants/tenants.repository.js';
import { env } from '../../config/env.js';
import {
  getManageableModuleCatalog,
  getPermissionCatalog,
  getPermissionCatalogItem,
  getPermissionKeysForRoles,
  isPermissionKey,
} from './permissions.catalog.js';
import { buildPlanContext, getPlanCatalog } from './plans.catalog.js';

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

    return { modules, permissions, plans: getPlanCatalog() };
  }

  static async getCurrentUserPermissions(user: AuthenticatedUser) {
    const tenant = user.tenant_id ? await TenantRepository.findById(user.tenant_id) : null;
    const planContext = buildPlanContext(tenant);
    const overrides = user.id ? await PermissionsRepository.getOverridesByUserId(user.id) : [];

    return this.buildPermissionSnapshot({
      roles: user.roles || [],
      overrides,
      planPermissionKeys: planContext.permission_keys,
      fullAccess: env.deploymentMode === 'LOCAL' || Boolean(user.root),
      planContext,
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
    const tenant = await TenantRepository.findById(actor.tenant_id);
    const planContext = buildPlanContext(tenant);
    const snapshot = this.buildPermissionSnapshot({
      roles,
      overrides,
      planPermissionKeys: planContext.permission_keys,
      fullAccess: env.deploymentMode === 'LOCAL' || Boolean(targetUser.root),
      planContext,
    });

    return {
      user: sanitizeUser(targetUser),
      roles,
      module_roles: roles.filter((role) => role.startsWith('module:')),
      overrides,
      effective_permissions: snapshot.effective_permissions,
      permissions: snapshot.permissions,
      access: snapshot.access,
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
    planPermissionKeys,
    fullAccess = false,
    planContext = null,
  }: {
    roles?: string[];
    overrides?: PermissionOverride[];
    planPermissionKeys?: string[];
    fullAccess?: boolean;
    planContext?: any;
  }) {
    const rolePermissions = new Set(getPermissionKeysForRoles(roles));
    const overrideMap = new Map(overrides.map((override) => [override.permission_key, override.effect]));
    const planPermissions = new Set(planPermissionKeys || getPermissionCatalog().map((permission) => permission.key));

    const permissions = getPermissionCatalog().map((permission) => {
      const effect = overrideMap.get(permission.key);
      const blockedByPlan = !fullAccess && !planPermissions.has(permission.key);

      if (fullAccess) {
        return {
          ...permission,
          allowed: true,
          source: env.deploymentMode === 'LOCAL' ? ('deployment:local' as const) : ('role' as const),
        };
      }

      if (effect === 'deny') {
        return {
          ...permission,
          allowed: false,
          source: 'override:deny' as const,
        };
      }

      if (effect === 'allow') {
        if (blockedByPlan) {
          return {
            ...permission,
            allowed: false,
            source: 'plan' as const,
          };
        }

        return {
          ...permission,
          allowed: true,
          source: 'override:allow' as const,
        };
      }

      if (rolePermissions.has(permission.key)) {
        if (blockedByPlan) {
          return {
            ...permission,
            allowed: false,
            source: 'plan' as const,
          };
        }

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
      access: planContext,
    };
  }

  static hasPermission(permissionKey: string, userPermissions: string[] = []) {
    return userPermissions.includes(permissionKey);
  }

  static getPermissionDefinition(permissionKey: string) {
    return getPermissionCatalogItem(permissionKey);
  }
}
