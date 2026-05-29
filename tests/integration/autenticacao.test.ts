import AutenticacaoController from '../../src/core/autenticacao/autenticacao.controller.js';
import AutenticacaoService from '../../src/core/autenticacao/autenticacao.service.js';
import AutenticacaoMiddleware from '../../src/core/middlewares/autenticacao.middleware.js';
import PermissoesService from '../../src/core/perfil/permissoes/permissoes.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Autenticação', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('config retorna configuração pública', async () => {
    jest.spyOn(AutenticacaoService, 'obterConfiguracaoPublica').mockResolvedValue({
      deployment_mode: 'LOCAL',
      tenant_count: 0,
      registration_enabled: true,
      onboarding_enabled: true,
      local_instance_configured: false,
      keycloak: { realm: 'operix', client_id: 'web', url: 'http://localhost:8080' },
    } as any);
    const res = criarResponseMock();

    await AutenticacaoController.config(criarRequestMock(), res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Configuração de autenticação carregada.',
      data: expect.objectContaining({
        keycloak: expect.objectContaining({ realm: 'operix' }),
      }),
    }));
  });

  test('me retorna snapshot da sessão autenticada', async () => {
    jest.spyOn(PermissoesService, 'obterPermissoesUsuarioAtual').mockResolvedValue({
      effective_permissions: ['organization.users.access'],
      access: { plan: 'trial' },
    } as any);
    const req = criarRequestMock({ user: { id: 1, username: 'admin', tenant_id: 1 } });
    const res = criarResponseMock();

    await AutenticacaoController.me(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Sessão carregada.',
      data: expect.objectContaining({
        permissions: ['organization.users.access'],
      }),
    }));
  });

  test('callback usa access_token para montar a sessão autenticada', async () => {
    jest.spyOn(AutenticacaoService, 'trocarCodigoAutorizacao').mockResolvedValue({
      access_token: 'access-token',
      id_token: 'id-token',
      refresh_token: 'refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
    } as any);
    jest.spyOn(AutenticacaoMiddleware, 'verificarTokenBruto').mockResolvedValue({
      id: 5,
      sub: 'kc-user',
      keycloak_id: 'kc-user',
      username: 'user',
      email: 'user@operix.dev',
      tenant_id: 1,
      roles: ['module:organization'],
    } as any);

    const req = criarRequestMock({
      body: {
        code: 'auth-code',
        redirect_uri: 'http://localhost:5173/#/auth/callback',
        code_verifier: 'verifier-1234567890123456',
      },
    });
    const res = criarResponseMock();

    await AutenticacaoController.callback(req, res);

    expect(AutenticacaoMiddleware.verificarTokenBruto).toHaveBeenCalledWith('access-token');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Login realizado com sucesso.',
      data: expect.objectContaining({
        token: 'access-token',
        id_token: 'id-token',
        user: expect.objectContaining({
          sub: 'kc-user',
          keycloak_id: 'kc-user',
        }),
      }),
    }));
  });

  test('refresh devolve o mesmo contrato de sessão do login', async () => {
    jest.spyOn(AutenticacaoService, 'renovarToken').mockResolvedValue({
      access_token: 'new-access-token',
      id_token: 'new-id-token',
      refresh_token: 'new-refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
    } as any);
    jest.spyOn(AutenticacaoMiddleware, 'verificarTokenBruto').mockResolvedValue({
      id: 8,
      sub: 'kc-refresh',
      keycloak_id: 'kc-refresh',
      username: 'refresh.user',
      email: 'refresh@operix.dev',
      tenant_id: 3,
      roles: ['module:inventory'],
    } as any);

    const req = criarRequestMock({ body: { refresh_token: 'refresh-token' } });
    const res = criarResponseMock();

    await AutenticacaoController.renovarToken(req, res);

    expect(AutenticacaoMiddleware.verificarTokenBruto).toHaveBeenCalledWith('new-access-token');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Refresh token realizado com sucesso!',
      data: expect.objectContaining({
        token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        id_token: 'new-id-token',
        user: expect.objectContaining({
          sub: 'kc-refresh',
        }),
      }),
    }));
  });

  test('concluirOnboarding delega ao serviço autenticado', async () => {
    jest.spyOn(AutenticacaoService, 'concluirOnboarding').mockResolvedValue({ id: 1, tenant_id: 10, admin: true } as any);
    const req = criarRequestMock({ user: { id: 1, sub: 'kc-1' }, body: { company_name: 'Operix' } });
    const res = criarResponseMock();

    await AutenticacaoController.concluirOnboarding(req, res);

    expect(AutenticacaoService.concluirOnboarding).toHaveBeenCalledWith(req.user, { company_name: 'Operix' });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
