import ErroValidacao from '../utils/erro-validacao.js';
import LocatarioModel from '../perfil/locatarios/locatarios.model.js';
import LocatarioRepository from '../perfil/locatarios/locatarios.repository.js';
import UsuariosRepository from '../perfil/usuarios/usuarios.repository.js';
import UsuarioModel from '../perfil/usuarios/usuarios.model.js';
import KeycloakAdminService from './keycloak-admin.service.js';
import { sanitizarUsuario } from '../utils/sanitizar.js';
import PoliticaLocatarioService from '../perfil/locatarios/politica-locatario.service.js';
import { env } from '../config/env.js';

export default class AutenticacaoService {
  private static buildLocalKeycloakGroupId(tenantName: string) {
    const normalized = tenantName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `local-${normalized || 'tenant'}`;
  }

  static async obterConfiguracaoPublica() {
    const tenantState = await PoliticaLocatarioService.obterEstadoPublico();
    return {
      ...tenantState,
      keycloak: {
        realm: env.keycloakRealm,
        client_id: env.keycloakClientId,
        url: env.keycloakUrl,
      },
    };
  }

  static construirUrlAutorizacao(params: {
    redirectUri: string;
    state: string;
    codeChallenge: string;
    identityProvider?: string;
  }) {
    return KeycloakAdminService.construirUrlAutorizacao(params);
  }

  static async trocarCodigoAutorizacao(code: string, redirectUri: string, codeVerifier: string) {
    return KeycloakAdminService.trocarCodigoAutorizacao(code, redirectUri, codeVerifier);
  }

  static construirPayloadSessao(tokenData: any, user: any) {
    return {
      token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      refresh_expires_in: tokenData.refresh_expires_in,
      token_type: tokenData.token_type,
      id_token: tokenData.id_token || null,
      user: sanitizarUsuario({
        id: user?.id || user?.sub,
        sub: user?.sub || user?.keycloak_id,
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

  static async renovarToken(renovarToken: string) {
    try {
      return await KeycloakAdminService.renovarToken(renovarToken);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao renovar token no Keycloak.');
    }
  }

  static async logout(renovarToken: string) {
    try {
      await KeycloakAdminService.logout(renovarToken);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao encerrar sessão no Keycloak.');
    }
  }

  static async concluirOnboarding(
    authenticatedUser: any,
    data: { company_name: string; cnpj?: string | null; description?: string | null },
  ) {
    
    if (!authenticatedUser?.sub) {
      throw new ErroValidacao('Usuário autenticado não identificado.', 401);
    }

    if (authenticatedUser.tenant_id) {
      const existingUser = await UsuariosRepository.findByKeycloakId(authenticatedUser.sub);
      return sanitizarUsuario(existingUser || authenticatedUser);
    }

    const tenantName = data.company_name?.trim();
    if (!tenantName) {
      throw new ErroValidacao('Nome da empresa é obrigatório.', 400);
    }

    return PoliticaLocatarioService.comBloqueioProvisionamentoLocatario(async () => {
      await PoliticaLocatarioService.assertLocatarioCanBeCreated();

      const existingTenant = await LocatarioRepository.findByName(tenantName);
      if (existingTenant) {
        throw new ErroValidacao('Unidade já cadastrada.', 409);
      }

      let adminToken: string | null = null;
      let groupId = this.buildLocalKeycloakGroupId(tenantName);
      let created = false;

      try {
        adminToken = await KeycloakAdminService.getAdminToken();
        const groupResult = await KeycloakAdminService.ensureGroupExists(tenantName, adminToken);
        groupId = groupResult.groupId;
        created = groupResult.created;
      } catch (error) {
        if (env.deploymentMode !== 'LOCAL') {
          throw error;
        }

        console.warn('[onboarding] Keycloak Admin indisponível no modo LOCAL; prosseguindo sem sincronizar grupos/roles.', error);
      }

      let tenant: any = null;

      try {
        tenant = await LocatarioRepository.criar(LocatarioModel.deRequisicao({
          name: tenantName,
          keycloak_group_id: groupId,
          cnpj: data.cnpj?.trim(),
          description: data.description?.trim(),
        }));

        const localUser = await UsuariosRepository.criar(new UsuarioModel({
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

        if (adminToken) {
          await KeycloakAdminService.addUserToGroup(authenticatedUser.sub, groupId, adminToken);

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
        }

        return sanitizarUsuario(localUser);
      } catch (error) {
        if (tenant?.id) {
          await LocatarioRepository.remover(tenant.id);
        }

        if (created && adminToken) {
          await KeycloakAdminService.deleteGroup(groupId, adminToken);
        }

        throw error;
      }
    });
  }

}
