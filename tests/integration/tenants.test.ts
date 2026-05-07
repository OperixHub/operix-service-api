import TenantsController from '../../src/core/profile/tenants/tenants.controller.js';
import TenantsService from '../../src/core/profile/tenants/tenants.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Tenants', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAll retorna tenants cadastrados', async () => {
    jest.spyOn(TenantsService, 'getAll').mockResolvedValue([{ id: 1, name: 'Tenant A' } as any]);
    const req = createRequestMock();
    const res = createResponseMock();

    await TenantsController.getAll(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Unidades listadas com sucesso',
      data: [{ id: 1, name: 'Tenant A' }],
    }));
  });

  test('create cria tenant', async () => {
    jest.spyOn(TenantsService, 'create').mockResolvedValue({ id: 10, name: 'Novo Tenant' } as any);
    const req = createRequestMock({ body: { name: 'Novo Tenant' } });
    const res = createResponseMock();

    await TenantsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Unidade criada com sucesso',
      data: { id: 10, name: 'Novo Tenant' },
    }));
  });

  test('remove encerra com 204', async () => {
    jest.spyOn(TenantsService, 'remove').mockResolvedValue(true as never);
    const req = createRequestMock({ params: { id: '1' } });
    const res = createResponseMock();

    await TenantsController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
