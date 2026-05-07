import SystemInfoController from '../../src/modules/notifications/system-info/system-info.controller.js';
import SystemInfoService from '../../src/modules/notifications/system-info/system-info.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Informações do Sistema', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getSystemInfo retorna payload do serviço', async () => {
    jest.spyOn(SystemInfoService, 'getSystemInfo').mockResolvedValue([{ id: 1, title: 'Serviço antigo' } as any]);
    const req = createRequestMock({ user: { tenant_id: 1 } });
    const res = createResponseMock();

    await SystemInfoController.getSystemInfo(req, res);

    expect(SystemInfoService.getSystemInfo).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Informações do sistema obtidas com sucesso',
      data: [{ id: 1, title: 'Serviço antigo' }],
    }));
  });
});
