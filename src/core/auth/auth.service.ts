import ValidationError from '../utils/validation-error.js';
import TenantModel from '../profile/tenants/tenants.model.js';
import TenantRepository from '../profile/tenants/tenants.repository.js';
import UsersRepository from '../profile/users/users.repository.js';
import UserModel from '../profile/users/users.model.js';
import KeycloakAdminService from './keycloak-admin.service.js';
import { sanitizeUser } from '../utils/sanitize.js';
import TenantPolicyService from '../profile/tenants/tenant-policy.service.js';
import { env } from '../config/env.js';

export default class AuthService {
  static async getPublicConfig() {
    const tenantState = await TenantPolicyService.getPublicState();
    return {
      ...tenantState,
      keycloak: {
        realm: env.keycloakRealm,
        client_id: env.keycloakClientId,
        url: env.keycloakUrl,
      },
    };
  }

  static buildAuthorizationUrl(params: {
    redirectUri: string;
    state: string;
    codeChallenge: string;
    identityProvider?: string;
  }) {
    return KeycloakAdminService.buildAuthorizationUrl(params);
  }

  static async exchangeAuthorizationCode(code: string, redirectUri: string, codeVerifier: string) {
    return KeycloakAdminService.exchangeAuthorizationCode(code, redirectUri, codeVerifier);
  }

  static buildSessionPayload(tokenData: any, user: any) {
    return {
      token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      refresh_expires_in: tokenData.refresh_expires_in,
      token_type: tokenData.token_type,
      user: sanitizeUser({
        id: user?.id || user?.sub,
        name: user?.name || user?.username || user?.preferred_username,
        username: user?.username || user?.preferred_username,
        email: user?.email || null,
        tenant_id: user?.tenant_id || null,
        keycloak_id: user?.keycloak_id || user?.sub,
        admin: Boolean(user?.admin),
        root: Boolean(user?.root),
        onboarding_required: Boolean(user?.onboarding_required),
        roles: user?.roles || [],
      }),
    };
  }

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

  static async completeOnboarding(
    authenticatedUser: any,
    data: { company_name: string; cnpj?: string | null; description?: string | null },
  ) {
    if (!authenticatedUser?.sub) {
      throw new ValidationError('Usuário autenticado não identificado.', 401);
    }

    if (authenticatedUser.tenant_id) {
      const existingUser = await UsersRepository.findByKeycloakId(authenticatedUser.sub);
      return sanitizeUser(existingUser || authenticatedUser);
    }

    const tenantName = data.company_name?.trim();
    if (!tenantName) {
      throw new ValidationError('Nome da empresa é obrigatório.', 400);
    }

    return TenantPolicyService.withTenantProvisioningLock(async () => {
      await TenantPolicyService.assertTenantCanBeCreated();

      const existingTenant = await TenantRepository.findByName(tenantName);
      if (existingTenant) {
        throw new ValidationError('Unidade já cadastrada.', 409);
      }

      const adminToken = await KeycloakAdminService.getAdminToken();
      const { groupId, created } = await KeycloakAdminService.ensureGroupExists(tenantName, adminToken);
      let tenant: any = null;

      try {
        tenant = await TenantRepository.create(TenantModel.fromRequest({
          name: tenantName,
          keycloak_group_id: groupId,
          cnpj: data.cnpj,
          description: data.description,
        }));

        await KeycloakAdminService.addUserToGroup(authenticatedUser.sub, groupId, adminToken);

        const localUser = await UsersRepository.create(new UserModel({
          tenant_id: tenant.id,
          name: authenticatedUser.name || authenticatedUser.username || authenticatedUser.email,
          username: authenticatedUser.username || authenticatedUser.preferred_username || authenticatedUser.email || authenticatedUser.sub,
          email: authenticatedUser.email || `${authenticatedUser.sub}@keycloak.local`,
          keycloak_id: authenticatedUser.sub,
          root: true,
          admin: true,
          active: true,
          preferences: {},
          password: null,
        }));

        await KeycloakAdminService.assignRealmRoles(authenticatedUser.sub, [
          'module:operational',
          'module:inventory',
          'module:organization',
          'module:notifications',
        ], adminToken);

        await KeycloakAdminService.updateUserAttributes(authenticatedUser.sub, {
          admin: ['true'],
          root: ['true'],
          tenant: [tenant.name],
          tenant_id: [String(tenant.id)],
        }, adminToken);

        return sanitizeUser(localUser);
      } catch (error) {
        if (tenant?.id) {
          await TenantRepository.remove(tenant.id);
        }

        if (created) {
          await KeycloakAdminService.deleteGroup(groupId, adminToken);
        }

        throw error;
      }
    });
  }

}
