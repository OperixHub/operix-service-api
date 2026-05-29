import PermissoesController from '../../src/core/perfil/permissoes/permissoes.controller.js';
import PermissoesService from '../../src/core/perfil/permissoes/permissoes.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Permissões', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterMeuPerfil retorna permissões efetivas do usuário autenticado', async () => {
    jest.spyOn(PermissoesService, 'obterPermissoesUsuarioAtual').mockResolvedValue({
      effective_permissions: ['organization.users.access'],
      permissions: [],
      access: { plan: 'trial' },
    } as any);
    const req = criarRequestMock({ user: { id: 1, roles: ['module:organization'] } });
    const res = criarResponseMock();

    await PermissoesController.obterMeuPerfil(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário autenticado obtidas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['organization.users.access'],
        roles: ['module:organization'],
      }),
    }));
  });

  test('obterCatalogo retorna catálogo agrupado', async () => {
    jest.spyOn(PermissoesService, 'obterCatalogo').mockReturnValue({ modules: [{ key: 'organization' }], permissions: [], plans: [] } as any);
    const req = criarRequestMock();
    const res = criarResponseMock();

    await PermissoesController.obterCatalogo(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Catálogo de permissões obtido com sucesso',
      data: expect.objectContaining({ modules: [{ key: 'organization' }] }),
    }));
  });

  test('obterUsuario retorna snapshot de permissões do usuário', async () => {
    jest.spyOn(PermissoesService, 'obterPermissoesUsuarioParaGestao').mockResolvedValue({
      user: { id: 2 },
      overrides: [{ permission_key: 'inventory.stock.access', effect: 'deny' }],
      effective_permissions: [],
      permissions: [],
      access: {},
      roles: ['module:inventory'],
      module_roles: ['module:inventory'],
    } as any);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { id: '2' } });
    const res = criarResponseMock();

    await PermissoesController.obterUsuario(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário obtidas com sucesso',
      data: expect.objectContaining({
        overrides: [{ permission_key: 'inventory.stock.access', effect: 'deny' }],
      }),
    }));
  });

  test('substituirSubstituicoesUsuario substitui overrides', async () => {
    jest.spyOn(PermissoesService, 'substituirSubstituicoesUsuario').mockResolvedValue({
      overrides: [{ permission_key: 'inventory.stock.access', effect: 'allow' }],
      effective_permissions: ['inventory.stock.access'],
    } as any);
    const req = criarRequestMock({
      user: { tenant_id: 1 },
      params: { id: '2' },
      body: { overrides: [{ permission_key: 'inventory.stock.access', effect: 'allow' }] },
    });
    const res = criarResponseMock();

    await PermissoesController.substituirSubstituicoesUsuario(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário atualizadas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['inventory.stock.access'],
      }),
    }));
  });
});
