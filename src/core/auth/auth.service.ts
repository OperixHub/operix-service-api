import ValidationError from '../utils/validation-error.js';
import TenantModel from '../identity/tenants/tenants.model.js';
import TenantRepository from '../identity/tenants/tenants.repository.js';
import UsersRepository from '../identity/users/users.repository.js';
import UserModel from '../identity/users/users.model.js';
import KeycloakAdminService from './keycloak-admin.service.js';
import { sanitizeUser } from '../utils/sanitize.js';

type RegistrationContext = {
  adminToken: string;
  userId?: string;
  groupId: string;
  groupCreated: boolean;
  tenant: {
    id: number;
    name: string;
    keycloak_group_id: string;
  };
  createdFirstTenantUser: boolean;
};

export default class AuthService {
  static async login(username: string, password: string) {
    try {
      return await KeycloakAdminService.login(username, password);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao realizar login no Keycloak.');
    }
  }

  static async refreshToken(refreshToken: string) {
    try {
      return await KeycloakAdminService.refreshToken(refreshToken);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao renovar token no Keycloak.');
    }
  }

  static async register(data: UserModel) {
    const tenantName = data.tenant?.trim();
    if (!tenantName) {
      throw new ValidationError('Empresa não informada.', 400);
    }

    const registrationContext = await this.prepareRegistrationContext(tenantName);
    const safeName = data.name.trim();
    const names = safeName.split(/\s+/).filter(Boolean);
    const firstName = names[0] || data.username;
    const lastName = names.slice(1).join(' ') || firstName;

    try {
      registrationContext.userId = await KeycloakAdminService.createUser({
        username: data.username,
        email: data.email,
        firstName,
        lastName,
        password: data.password || '',
        attributes: {
          admin: [String(Boolean(registrationContext.createdFirstTenantUser || data.admin))],
          root: [String(Boolean(registrationContext.createdFirstTenantUser || data.root))],
          tenant: [registrationContext.tenant.name],
          tenant_id: [String(registrationContext.tenant.id)],
        },
      }, registrationContext.adminToken);

      await KeycloakAdminService.addUserToGroup(
        registrationContext.userId,
        registrationContext.groupId,
        registrationContext.adminToken,
      );

      const persistedUser = await UsersRepository.create(new UserModel({
        ...data,
        tenant: registrationContext.tenant.name,
        tenant_id: registrationContext.tenant.id,
        keycloak_id: registrationContext.userId,
        admin: registrationContext.createdFirstTenantUser || data.admin,
        root: registrationContext.createdFirstTenantUser || data.root,
        password: null,
      }));

      await KeycloakAdminService.updateUserAttributes(registrationContext.userId, {
        admin: [String(Boolean(persistedUser.admin))],
        root: [String(Boolean(persistedUser.root))],
        tenant: [registrationContext.tenant.name],
        tenant_id: [String(registrationContext.tenant.id)],
      }, registrationContext.adminToken);

      return sanitizeUser(persistedUser);
    } catch (error) {
      await this.compensateRegistration(registrationContext);
      throw error;
    }
  }

  private static async prepareRegistrationContext(tenantName: string): Promise<RegistrationContext> {
    const adminToken = await KeycloakAdminService.getAdminToken();
    const { groupId, created } = await KeycloakAdminService.ensureGroupExists(tenantName, adminToken);

    let tenant = await TenantRepository.findByKeycloakGroupId(groupId);
    let createdFirstTenantUser = false;

    if (!tenant) {
      tenant = await TenantRepository.findByName(tenantName);
    }

    if (!tenant) {
      tenant = await TenantRepository.create(TenantModel.fromRequest({
        name: tenantName,
        keycloak_group_id: groupId,
      }));
      createdFirstTenantUser = true;
    }

    return {
      adminToken,
      groupId,
      groupCreated: created,
      tenant,
      createdFirstTenantUser,
    };
  }

  private static async compensateRegistration(context: RegistrationContext) {
    const rollbackErrors: string[] = [];

    if (context.createdFirstTenantUser) {
      try {
        await TenantRepository.remove(context.tenant.id);
      } catch (error: any) {
        rollbackErrors.push(error.message || 'Falha ao remover tenant local.');
      }
    }

    if (context.userId) {
      try {
        await KeycloakAdminService.deleteUser(context.userId, context.adminToken);
      } catch (error: any) {
        rollbackErrors.push(error.message || 'Falha ao remover usuário do IAM.');
      }
    }

    if (context.groupCreated && context.createdFirstTenantUser) {
      try {
        await KeycloakAdminService.deleteGroup(context.groupId, context.adminToken);
      } catch (error: any) {
        rollbackErrors.push(error.message || 'Falha ao remover grupo do IAM.');
      }
    }

    if (rollbackErrors.length > 0) {
      throw new Error(`Falha no cadastro e no rollback: ${rollbackErrors.join(' | ')}`);
    }
  }
}
