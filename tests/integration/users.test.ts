import UsersController from '../../src/core/profile/users/users.controller.js';
import UsersService from '../../src/core/profile/users/users.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Usuários', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAll lista usuários do tenant autenticado', async () => {
    jest.spyOn(UsersService, 'getAll').mockResolvedValue([{ id: 1, username: 'admin' } as any]);
    const req = createRequestMock({ user: { tenant_id: 1 } });
    const res = createResponseMock();

    await UsersController.getAll(req, res);

    expect(UsersService.getAll).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Usuários listados com sucesso',
      data: [{ id: 1, username: 'admin' }],
    }));
  });

  test('create cria usuário no tenant autenticado', async () => {
    jest.spyOn(UsersService, 'create').mockResolvedValue({ id: 22, username: 'maria', tenant_id: 1 } as any);
    const req = createRequestMock({
      user: { tenant_id: 1 },
      body: {
        name: 'Maria',
        username: 'maria',
        email: 'maria@operix.dev',
        password: '12345678',
        modules: ['inventory'],
      },
    });
    const res = createResponseMock();

    await UsersController.create(req, res);

    expect(UsersService.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Usuário criado com sucesso',
      data: { id: 22, username: 'maria', tenant_id: 1 },
    }));
  });

  test('remove responde 204 quando o serviço conclui remoção', async () => {
    jest.spyOn(UsersService, 'remove').mockResolvedValue(true as never);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { id: '2' } });
    const res = createResponseMock();

    await UsersController.remove(req, res);

    expect(UsersService.remove).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  test('updateAccess atualiza acesso do usuário', async () => {
    jest.spyOn(UsersService, 'updateAccess').mockResolvedValue({ id: 2, active: false } as any);
    const req = createRequestMock({
      user: { id: 1, tenant_id: 1, root: true },
      params: { id: '2' },
      body: { active: false },
    });
    const res = createResponseMock();

    await UsersController.updateAccess(req, res);

    expect(UsersService.updateAccess).toHaveBeenCalledWith(2, req.user, expect.anything());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Usuário atualizado com sucesso',
      data: { id: 2, active: false },
    }));
  });
});
