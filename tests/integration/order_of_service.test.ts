import OrderOfServiceController from '../../src/modules/operational/order-of-service/order-of-service.controller.js';
import OrderOfServiceService from '../../src/modules/operational/order-of-service/order-of-service.service.js';
import Utils from '../../src/core/utils/utils.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Ordem de Serviço (Order of Service)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAll lista ordens', async () => {
    jest.spyOn(OrderOfServiceService, 'getAll').mockResolvedValue([{ id: 1, cod: 'OS123' } as any]);
    const req = createRequestMock({ user: { tenant_id: 1 } });
    const res = createResponseMock();

    await OrderOfServiceController.getAll(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Ordens de serviço listadas com sucesso' }));
  });

  test('getUnique retorna detalhe da ordem', async () => {
    jest.spyOn(OrderOfServiceService, 'getUnique').mockResolvedValue([{ id: 1, cod: 'OS123' }] as any);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { cod: 'OS123' } });
    const res = createResponseMock();

    await OrderOfServiceController.getUnique(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Ordem de serviço detalhada com sucesso' }));
  });

  test('updateEstimate completa orçamento', async () => {
    jest.spyOn(OrderOfServiceService, 'getUnique').mockResolvedValue([{ estimate: '[]' }] as any);
    jest.spyOn(OrderOfServiceService, 'updateEstimate').mockResolvedValue({ ok: true } as any);
    jest.spyOn(Utils, 'generateUuid').mockReturnValue('uuid-1');
    const req = createRequestMock({
      user: { tenant_id: 1 },
      params: { cod: 'OS123' },
      body: { type: 'completa', amount: 1, description: 'Item', price: 50 },
    });
    const res = createResponseMock();

    await OrderOfServiceController.updateEstimate(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Orçamento atualizado com sucesso' }));
  });

  test('removeEstimate retorna 204', async () => {
    jest.spyOn(OrderOfServiceService, 'removeEstimate').mockResolvedValue(true as never);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { cod: 'OS123', idEstimate: '1' } });
    const res = createResponseMock();

    await OrderOfServiceController.removeEstimate(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
