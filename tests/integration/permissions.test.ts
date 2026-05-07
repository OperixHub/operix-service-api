import PermissionsController from '../../src/core/profile/permissions/permissions.controller.js';
import PermissionsService from '../../src/core/profile/permissions/permissions.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Permissões', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getMe retorna permissões efetivas do usuário autenticado', async () => {
    jest.spyOn(PermissionsService, 'getCurrentUserPermissions').mockResolvedValue({
      effective_permissions: ['organization.users.access'],
      permissions: [],
      access: { plan: 'trial' },
    } as any);
    const req = createRequestMock({ user: { id: 1, roles: ['module:organization'] } });
    const res = createResponseMock();

    await PermissionsController.getMe(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário autenticado obtidas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['organization.users.access'],
        roles: ['module:organization'],
      }),
    }));
  });

  test('getCatalog retorna catálogo agrupado', async () => {
    jest.spyOn(PermissionsService, 'getCatalog').mockReturnValue({ modules: [{ key: 'organization' }], permissions: [], plans: [] } as any);
    const req = createRequestMock();
    const res = createResponseMock();

    await PermissionsController.getCatalog(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Catálogo de permissões obtido com sucesso',
      data: expect.objectContaining({ modules: [{ key: 'organization' }] }),
    }));
  });

  test('getUser retorna snapshot de permissões do usuário', async () => {
    jest.spyOn(PermissionsService, 'getUserPermissionsForManagement').mockResolvedValue({
      user: { id: 2 },
      overrides: [{ permission_key: 'inventory.stock.access', effect: 'deny' }],
      effective_permissions: [],
      permissions: [],
      access: {},
      roles: ['module:inventory'],
      module_roles: ['module:inventory'],
    } as any);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { id: '2' } });
    const res = createResponseMock();

    await PermissionsController.getUser(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário obtidas com sucesso',
      data: expect.objectContaining({
        overrides: [{ permission_key: 'inventory.stock.access', effect: 'deny' }],
      }),
    }));
  });

  test('replaceUserOverrides substitui overrides', async () => {
    jest.spyOn(PermissionsService, 'replaceUserOverrides').mockResolvedValue({
      overrides: [{ permission_key: 'inventory.stock.access', effect: 'allow' }],
      effective_permissions: ['inventory.stock.access'],
    } as any);
    const req = createRequestMock({
      user: { tenant_id: 1 },
      params: { id: '2' },
      body: { overrides: [{ permission_key: 'inventory.stock.access', effect: 'allow' }] },
    });
    const res = createResponseMock();

    await PermissionsController.replaceUserOverrides(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário atualizadas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['inventory.stock.access'],
      }),
    }));
  });
});
