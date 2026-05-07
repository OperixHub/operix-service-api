import ServicesController from '../../src/modules/operational/services/services.controller.js';
import ServicesService from '../../src/modules/operational/services/services.service.js';
import MessagingService from '../../src/core/utils/messaging.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Serviços (Services)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAll lista serviços', async () => {
    jest.spyOn(ServicesService, 'getAll').mockResolvedValue([{ id: 1, product: 'Repair' } as any]);
    const req = createRequestMock({ user: { tenant_id: 1 } });
    const res = createResponseMock();

    await ServicesController.getAll(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Serviços listados com sucesso' }));
  });

  test('getAllWharehouse lista almoxerifado', async () => {
    jest.spyOn(ServicesService, 'getAllWharehouse').mockResolvedValue([{ id: 1, quantity: 10 } as any]);
    const req = createRequestMock({ user: { tenant_id: 1 } });
    const res = createResponseMock();

    await ServicesController.getAllWharehouse(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Serviços do almoxerifado listados com sucesso' }));
  });

  test('create cria serviço e notifica tenant', async () => {
    jest.spyOn(ServicesService, 'create').mockResolvedValue({ id: 11 } as any);
    const notifySpy = jest.spyOn(MessagingService, 'notifyTenant').mockImplementation(() => undefined);
    const req = createRequestMock({ user: { tenant_id: 1 }, body: { product: 'Maintenance', client: 'John' } });
    const res = createResponseMock();

    await ServicesController.create(req, res);

    expect(notifySpy).toHaveBeenCalledWith(1, '@service/created', { id: 11 });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('updateInfoClient atualiza dados do cliente', async () => {
    jest.spyOn(ServicesService, 'updateInfoClient').mockResolvedValue({ id: 1 } as any);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { id: '1' }, body: { client: 'John Doe' } });
    const res = createResponseMock();

    await ServicesController.updateInfoClient(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Informações do cliente atualizadas com sucesso' }));
  });

  test('remove retorna 204', async () => {
    jest.spyOn(ServicesService, 'remove').mockResolvedValue(true as never);
    const req = createRequestMock({ user: { tenant_id: 1 }, params: { id: '1', cod: 'OS123', typeTable: 'OS' } });
    const res = createResponseMock();

    await ServicesController.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
