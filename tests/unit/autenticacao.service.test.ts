import AutenticacaoService from '../../src/core/autenticacao/autenticacao.service.js';
import KeycloakAdminService from '../../src/core/autenticacao/keycloak-admin.service.js';
import LocatarioRepository from '../../src/core/perfil/locatarios/locatarios.repository.js';
import UsuariosRepository from '../../src/core/perfil/usuarios/usuarios.repository.js';
import PoliticaLocatarioService from '../../src/core/perfil/locatarios/politica-locatario.service.js';
import { sanitizarUsuario } from '../../src/core/utils/sanitizar.js';

describe('AutenticacaoService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('construirPayloadSessao preserva sub e keycloak_id no usuário autenticado', () => {
    const result = AutenticacaoService.construirPayloadSessao({
      access_token: 'access-token',
      id_token: 'id-token',
      refresh_token: 'refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
    }, {
      id: 22,
      sub: 'kc-google',
      keycloak_id: 'kc-google',
      name: 'Google User',
      username: 'google.user',
      email: 'google@operix.dev',
      tenant_id: 11,
      admin: true,
      root: true,
      roles: ['module:organization'],
    });

    expect(result.token).toBe('access-token');
    expect(result.id_token).toBe('id-token');
    expect(result.user).toEqual(expect.objectContaining({
      id: 22,
      sub: 'kc-google',
      keycloak_id: 'kc-google',
      username: 'google.user',
      email: 'google@operix.dev',
    }));
  });

  test('sanitizarUsuario usa keycloak_id como fallback para sub', () => {
    const result = sanitizarUsuario({
      id: 22,
      keycloak_id: 'kc-google',
      username: 'google.user',
    });

    expect(result).toEqual(expect.objectContaining({
      id: 22,
      sub: 'kc-google',
      keycloak_id: 'kc-google',
      username: 'google.user',
    }));
  });

  test('concluirOnboarding cria tenant e vincula usuário autenticado como admin', async () => {
    jest.spyOn(PoliticaLocatarioService, 'comBloqueioProvisionamentoLocatario').mockImplementation(async (callback: any) => callback());
    jest.spyOn(PoliticaLocatarioService, 'assertLocatarioCanBeCreated').mockResolvedValue(undefined as never);
    jest.spyOn(LocatarioRepository, 'findByName').mockResolvedValue(null);
    jest.spyOn(KeycloakAdminService, 'getAdminToken').mockResolvedValue('admin-token');
    jest.spyOn(KeycloakAdminService, 'ensureGroupExists').mockResolvedValue({ groupId: 'group-3', created: true });
    jest.spyOn(LocatarioRepository, 'criar').mockResolvedValue({
      id: 11,
      name: 'Onboarding Ltda',
      keycloak_group_id: 'group-3',
      cnpj: '123',
      description: 'Teste',
    } as any);
    jest.spyOn(KeycloakAdminService, 'addUserToGroup').mockResolvedValue(undefined as never);
    jest.spyOn(KeycloakAdminService, 'assignRealmRoles').mockResolvedValue(undefined as never);
    jest.spyOn(KeycloakAdminService, 'updateUserAttributes').mockResolvedValue(undefined as never);
    jest.spyOn(UsuariosRepository, 'criar').mockResolvedValue({
      id: 22,
      name: 'Google User',
      username: 'google.user',
      email: 'google@operix.dev',
      tenant_id: 11,
      keycloak_id: 'kc-google',
      admin: true,
      root: true,
    } as any);

    const result = await AutenticacaoService.concluirOnboarding({
      sub: 'kc-google',
      name: 'Google User',
      username: 'google.user',
      email: 'google@operix.dev',
      tenant_id: null,
    }, {
      company_name: 'Onboarding Ltda',
      cnpj: '123',
      description: 'Teste',
    });

    expect(KeycloakAdminService.addUserToGroup).toHaveBeenCalledWith('kc-google', 'group-3', 'admin-token');
    expect(KeycloakAdminService.updateUserAttributes).toHaveBeenCalledWith('kc-google', expect.objectContaining({
      tenant_id: ['11'],
      admin: ['true'],
      root: ['true'],
    }), 'admin-token');
    expect(result).toEqual(expect.objectContaining({
      tenant_id: 11,
      admin: true,
      root: true,
    }));
  });
});
