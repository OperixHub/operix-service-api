import InformacoesSistemaController from '../../src/modules/notificacoes/informacoes-sistema/informacoes-sistema.controller.js';
import InformacoesSistemaService from '../../src/modules/notificacoes/informacoes-sistema/informacoes-sistema.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Informações do Sistema', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterInformacoesSistema retorna payload do serviço', async () => {
    jest.spyOn(InformacoesSistemaService, 'obterInformacoesSistema').mockResolvedValue([{ id: 1, title: 'Serviço antigo' } as any]);
    const req = criarRequestMock({ user: { tenant_id: 1 } });
    const res = criarResponseMock();

    await InformacoesSistemaController.obterInformacoesSistema(req, res);

    expect(InformacoesSistemaService.obterInformacoesSistema).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Informações do sistema obtidas com sucesso',
      data: [{ id: 1, title: 'Serviço antigo' }],
    }));
  });
});
