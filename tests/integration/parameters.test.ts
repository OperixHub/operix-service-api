import StatusPaymentController from '../../src/modules/operational/status-payment/status-payment.controller.js';
import StatusPaymentService from '../../src/modules/operational/status-payment/status-payment.service.js';
import StatusServiceController from '../../src/modules/operational/status-service/status-service.controller.js';
import StatusServiceService from '../../src/modules/operational/status-service/status-service.service.js';
import TypesProductController from '../../src/modules/operational/types-product/types-product.controller.js';
import TypesProductService from '../../src/modules/operational/types-product/types-product.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Parâmetros (Status e Tipos)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('status payment lista e cria registros', async () => {
    jest.spyOn(StatusPaymentService, 'getAll').mockResolvedValue([{ id: 1 } as any]);
    jest.spyOn(StatusPaymentService, 'create').mockResolvedValue({ id: 2 } as any);

    const listReq = createRequestMock({ user: { tenant_id: 1 } });
    const listRes = createResponseMock();
    await StatusPaymentController.getAll(listReq, listRes);

    const createReq = createRequestMock({ user: { tenant_id: 1 }, body: { description: 'Paid' } });
    const createRes = createResponseMock();
    await StatusPaymentController.create(createReq, createRes);

    expect(listRes.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Status de pagamento listados com sucesso' }));
    expect(createRes.status).toHaveBeenCalledWith(201);
  });

  test('status service lista e cria registros', async () => {
    jest.spyOn(StatusServiceService, 'getAll').mockResolvedValue([{ id: 1 } as any]);
    jest.spyOn(StatusServiceService, 'create').mockResolvedValue({ id: 2 } as any);

    const listReq = createRequestMock({ user: { tenant_id: 1 } });
    const listRes = createResponseMock();
    await StatusServiceController.getAll(listReq, listRes);

    const createReq = createRequestMock({ user: { tenant_id: 1 }, body: { description: 'Done' } });
    const createRes = createResponseMock();
    await StatusServiceController.create(createReq, createRes);

    expect(listRes.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Status de serviço listados com sucesso' }));
    expect(createRes.status).toHaveBeenCalledWith(201);
  });

  test('types product lista e cria registros', async () => {
    jest.spyOn(TypesProductService, 'getAll').mockResolvedValue([{ id: 1 } as any]);
    jest.spyOn(TypesProductService, 'create').mockResolvedValue({ id: 2 } as any);

    const listReq = createRequestMock({ user: { tenant_id: 1 } });
    const listRes = createResponseMock();
    await TypesProductController.getAll(listReq, listRes);

    const createReq = createRequestMock({ user: { tenant_id: 1 }, body: { name: 'Grocery' } });
    const createRes = createResponseMock();
    await TypesProductController.create(createReq, createRes);

    expect(listRes.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Tipos de produto listados com sucesso' }));
    expect(createRes.status).toHaveBeenCalledWith(201);
  });
});
