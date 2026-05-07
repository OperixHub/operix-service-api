import ProfileSettingsController from '../../src/core/profile/profile-settings.controller.js';
import PermissionsService from '../../src/core/profile/permissions/permissions.service.js';
import TenantRepository from '../../src/core/profile/tenants/tenants.repository.js';
import TenantsService from '../../src/core/profile/tenants/tenants.service.js';
import UsersService from '../../src/core/profile/users/users.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Perfil', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getMe retorna perfil sanitizado', async () => {
    const req = createRequestMock({ user: { id: 7, sub: 'kc-owner', username: 'owner', tenant_id: 3 } });
    const res = createResponseMock();

    await ProfileSettingsController.getMe(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Perfil carregado com sucesso',
      data: expect.objectContaining({ sub: 'kc-owner', username: 'owner' }),
    }));
  });

  test('updateMe atualiza perfil do usuário', async () => {
    jest.spyOn(UsersService, 'updateOwnProfile').mockResolvedValue({ id: 7, role_title: 'Diretor' } as any);
    const req = createRequestMock({ user: { id: 7, tenant_id: 3 }, body: { role_title: 'Diretor' } });
    const res = createResponseMock();

    await ProfileSettingsController.updateMe(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Perfil atualizado com sucesso',
      data: { id: 7, role_title: 'Diretor' },
    }));
  });

  test('getCompany retorna empresa do tenant', async () => {
    jest.spyOn(TenantRepository, 'findById').mockResolvedValue({ id: 3, name: 'Operix' } as any);
    const req = createRequestMock({ user: { tenant_id: 3 } });
    const res = createResponseMock();

    await ProfileSettingsController.getCompany(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Empresa carregada com sucesso',
      data: { id: 3, name: 'Operix' },
    }));
  });

  test('updateCompany atualiza empresa atual', async () => {
    jest.spyOn(TenantsService, 'update').mockResolvedValue({ id: 3, name: 'Operix Updated' } as any);
    const req = createRequestMock({ user: { tenant_id: 3 }, body: { name: 'Operix Updated' } });
    const res = createResponseMock();

    await ProfileSettingsController.updateCompany(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Empresa atualizada com sucesso',
      data: { id: 3, name: 'Operix Updated' },
    }));
  });

  test('getSystem retorna catálogo e permissões efetivas', async () => {
    jest.spyOn(PermissionsService, 'getCurrentUserPermissions').mockResolvedValue({
      access: { plan: 'trial' },
      effective_permissions: ['organization.settings.access'],
      permissions: [],
    } as any);
    jest.spyOn(PermissionsService, 'getCatalog').mockReturnValue({ modules: [], permissions: [], plans: [] } as any);
    const req = createRequestMock({ user: { tenant_id: 3 } });
    const res = createResponseMock();

    await ProfileSettingsController.getSystem(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Configurações do sistema carregadas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['organization.settings.access'],
        catalog: { modules: [], permissions: [], plans: [] },
      }),
    }));
  });
});
