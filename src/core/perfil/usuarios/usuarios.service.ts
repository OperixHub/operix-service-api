import ErroValidacao from '../../utils/erro-validacao.js';
import type UsuarioModel from './usuarios.model.js';
import UsuariosRepository from './usuarios.repository.js';
import LocatariosRepository from '../locatarios/locatarios.repository.js';
import KeycloakAdminService from '../../autenticacao/keycloak-admin.service.js';
import { getRoleKeyForModule } from '../permissoes/permissoes.catalog.js';
import { sanitizarUsuario } from '../../utils/sanitizar.js';

export default class UsuariosService {
  static async obterTodos(tenantId: number) {
    return UsuariosRepository.obterTodos(tenantId);
  }

  static async criar(
    user: UsuarioModel,
    actor: { tenant_id?: number | null },
    moduleKeys: string[] = [],
  ) {
    if (!actor.tenant_id) {
      throw new ErroValidacao('Tenant do usuário autenticado não encontrado.', 422);
    }

    const tenant = await LocatariosRepository.findById(actor.tenant_id);
    if (!tenant) {
      throw new ErroValidacao('Unidade do usuário autenticado não encontrada.', 404);
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

      const persistedUser = await UsuariosRepository.criar({
        ...user,
        tenant: tenant.name,
        tenant_id: tenant.id,
        keycloak_id: keycloakId,
        password: null,
      } as UsuarioModel);

      await KeycloakAdminService.updateUserAttributes(keycloakId, {
        admin: [String(Boolean(persistedUser.admin))],
        root: [String(Boolean(persistedUser.root))],
        tenant: [tenant.name],
        tenant_id: [String(tenant.id)],
      }, adminToken);

      return sanitizarUsuario(persistedUser);
    } catch (error) {
      if (keycloakId) {
        await KeycloakAdminService.deleteUser(keycloakId, adminToken);
      }

      throw error;
    }
  }

  static async remover(user: UsuarioModel, tenantId: number) {
    const result = await UsuariosRepository.getById(user, tenantId);

    if (!result || result.length === 0) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    if (result[0].admin === true) {
      throw new ErroValidacao('Usuário administrador não pode ser removido.', 422);
    }

    if (result[0].keycloak_id) {
      const adminToken = await KeycloakAdminService.getAdminToken();
      await KeycloakAdminService.deleteUser(result[0].keycloak_id, adminToken);
    }

    return UsuariosRepository.remover(user, tenantId);
  }

  static async atualizarAcesso(
    usuarioAlvoId: number,
    actor: { tenant_id?: number | null; id?: number | null; root?: boolean | null },
    data: Partial<UsuarioModel>,
  ) {
    if (!actor.tenant_id) {
      throw new ErroValidacao('Tenant do usuário autenticado não encontrado.', 422);
    }

    const usuarioAlvo = await UsuariosRepository.findByIdAndTenantId(usuarioAlvoId, actor.tenant_id);
    if (!usuarioAlvo) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    if (usuarioAlvo.root && !actor.root) {
      throw new ErroValidacao('Somente o proprietário pode alterar outro proprietário.', 403);
    }

    const updated = await UsuariosRepository.atualizarAcessoUsuario(usuarioAlvoId, actor.tenant_id, data);
    return sanitizarUsuario(updated);
  }

  static async atualizarPerfilProprio(
    actor: { tenant_id?: number | null; id?: number | null },
    data: Partial<UsuarioModel>,
  ) {
    if (!actor.tenant_id || !actor.id) {
      throw new ErroValidacao('Usuário autenticado não encontrado.', 422);
    }

    const updated = await UsuariosRepository.atualizarPerfil(actor.id, actor.tenant_id, data);
    if (!updated) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    return sanitizarUsuario(updated);
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
