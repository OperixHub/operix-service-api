import AuthService from '../../src/core/auth/auth.service.js';
import KeycloakAdminService from '../../src/core/auth/keycloak-admin.service.js';
import TenantRepository from '../../src/core/identity/tenants/tenants.repository.js';
import UsersRepository from '../../src/core/identity/users/users.repository.js';
import UserModel from '../../src/core/identity/users/users.model.js';

describe('AuthService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('register cria tenant, usuÃ¡rio local e sincroniza atributos no Keycloak', async () => {
    jest.spyOn(KeycloakAdminService, 'getAdminToken').mockResolvedValue('admin-token');
    jest.spyOn(KeycloakAdminService, 'ensureGroupExists').mockResolvedValue({ groupId: 'group-1', created: true });
    jest.spyOn(TenantRepository, 'findByKeycloakGroupId').mockResolvedValue(null);
    jest.spyOn(TenantRepository, 'findByName').mockResolvedValue(null);
    jest.spyOn(TenantRepository, 'create').mockResolvedValue({ id: 8, name: 'Operix', keycloak_group_id: 'group-1' } as any);
    jest.spyOn(KeycloakAdminService, 'createUser').mockResolvedValue('kc-1');
    jest.spyOn(KeycloakAdminService, 'addUserToGroup').mockResolvedValue(undefined as never);
    const createUserSpy = jest.spyOn(UsersRepository, 'create').mockResolvedValue({
      id: 15,
      name: 'Jane Doe',
      username: 'jane',
      email: 'jane@operix.dev',
      tenant: 'Operix',
      tenant_id: 8,
      keycloak_id: 'kc-1',
      admin: true,
      root: true,
    } as any);
    const updateAttributesSpy = jest.spyOn(KeycloakAdminService, 'updateUserAttributes').mockResolvedValue(undefined as never);

    const result = await AuthService.register(UserModel.fromRequest({
      name: 'Jane Doe',
      username: 'jane',
      email: 'jane@operix.dev',
      password: '12345678',
      tenant: 'Operix',
    }));

    expect(createUserSpy).toHaveBeenCalled();
    expect(updateAttributesSpy).toHaveBeenCalledWith('kc-1', expect.objectContaining({
      tenant_id: ['8'],
      admin: ['true'],
      root: ['true'],
    }), 'admin-token');
    expect(result).toEqual(expect.objectContaining({
      id: 15,
      username: 'jane',
      tenant_id: 8,
      keycloak_id: 'kc-1',
      admin: true,
      root: true,
    }));
  });

  test('register executa compensaÃ§Ã£o quando persistÃªncia local falha', async () => {
    jest.spyOn(KeycloakAdminService, 'getAdminToken').mockResolvedValue('admin-token');
    jest.spyOn(KeycloakAdminService, 'ensureGroupExists').mockResolvedValue({ groupId: 'group-2', created: true });
    jest.spyOn(TenantRepository, 'findByKeycloakGroupId').mockResolvedValue(null);
    jest.spyOn(TenantRepository, 'findByName').mockResolvedValue(null);
    const removeTenantSpy = jest.spyOn(TenantRepository, 'remove').mockResolvedValue(1 as never);
    jest.spyOn(TenantRepository, 'create').mockResolvedValue({ id: 9, name: 'Nova', keycloak_group_id: 'group-2' } as any);
    jest.spyOn(KeycloakAdminService, 'createUser').mockResolvedValue('kc-2');
    jest.spyOn(KeycloakAdminService, 'addUserToGroup').mockResolvedValue(undefined as never);
    const deleteUserSpy = jest.spyOn(KeycloakAdminService, 'deleteUser').mockResolvedValue(undefined as never);
    const deleteGroupSpy = jest.spyOn(KeycloakAdminService, 'deleteGroup').mockResolvedValue(undefined as never);
    jest.spyOn(UsersRepository, 'create').mockRejectedValue(new Error('db down'));

    await expect(AuthService.register(UserModel.fromRequest({
      name: 'John Doe',
      username: 'john',
      email: 'john@operix.dev',
      password: '12345678',
      tenant: 'Nova',
    }))).rejects.toThrow('db down');

    expect(deleteUserSpy).toHaveBeenCalledWith('kc-2', 'admin-token');
    expect(deleteGroupSpy).toHaveBeenCalledWith('group-2', 'admin-token');
    expect(removeTenantSpy).toHaveBeenCalledWith(9);
  });
});
