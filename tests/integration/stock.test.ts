import StockController from '../../src/modules/inventory/stock/stock.controller.js';
import StockService from '../../src/modules/inventory/stock/stock.service.js';
import MessagingService from '../../src/core/utils/messaging.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Estoque (Stock)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAll retorna itens do estoque', async () => {
    jest.spyOn(StockService, 'getAll').mockResolvedValue([{ id: 1, name: 'Peça A' } as any]);
    const req = createRequestMock({ user: { tenant_id: 1 } });
    const res = createResponseMock();

    await StockController.getAll(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Estoque listado com sucesso',
      data: [{ id: 1, name: 'Peça A' }],
    }));
  });

  test('create cria item de estoque', async () => {
    jest.spyOn(StockService, 'create').mockResolvedValue({ id: 2, name: 'Peça B' } as any);
    const req = createRequestMock({ user: { tenant_id: 1 }, body: { name: 'Peça B', code: 'PB', quantity: 5 } });
    const res = createResponseMock();

    await StockController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Item de estoque criado com sucesso',
      data: { id: 2, name: 'Peça B' },
    }));
  });

  test('update dispara alerta de estoque baixo quando quantity <= 5', async () => {
    jest.spyOn(StockService, 'update').mockResolvedValue({ id: 1, quantity: 3 } as any);
    const notifySpy = jest.spyOn(MessagingService, 'notifyTenant').mockImplementation(() => undefined);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { id: '1' }, body: { quantity: 3 } });
    const res = createResponseMock();

    await StockController.update(req, res);

    expect(notifySpy).toHaveBeenCalledWith(1, '@stock/low_stock_alert', { id: 1, quantity: 3 });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Item de estoque atualizado com sucesso' }));
  });

  test('remove retorna item removido', async () => {
    jest.spyOn(StockService, 'remove').mockResolvedValue({ id: 1 } as any);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { id: '1' } });
    const res = createResponseMock();

    await StockController.remove(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Item de estoque removido com sucesso' }));
  });
});
