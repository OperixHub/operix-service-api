import AuthController from '../../src/core/auth/auth.controller.js';
import AuthService from '../../src/core/auth/auth.service.js';
import PermissionsService from '../../src/core/profile/permissions/permissions.service.js';
import { createRequestMock, createResponseMock } from '../support/express-mocks.js';

describe('Testes de Integração - Rotas de Autenticação', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('config retorna configuração pública', async () => {
    jest.spyOn(AuthService, 'getPublicConfig').mockResolvedValue({
      deployment_mode: 'LOCAL',
      tenant_count: 0,
      registration_enabled: true,
      onboarding_enabled: true,
      local_instance_configured: false,
      keycloak: { realm: 'operix', client_id: 'web', url: 'http://localhost:8080' },
    } as any);
    const res = createResponseMock();

    await AuthController.config(createRequestMock(), res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Configuração de autenticação carregada.',
      data: expect.objectContaining({
        keycloak: expect.objectContaining({ realm: 'operix' }),
      }),
    }));
  });

  test('me retorna snapshot da sessão autenticada', async () => {
    jest.spyOn(PermissionsService, 'getCurrentUserPermissions').mockResolvedValue({
      effective_permissions: ['organization.users.access'],
      access: { plan: 'trial' },
    } as any);
    const req = createRequestMock({ user: { id: 1, username: 'admin', tenant_id: 1 } });
    const res = createResponseMock();

    await AuthController.me(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Sessão carregada.',
      data: expect.objectContaining({
        permissions: ['organization.users.access'],
      }),
    }));
  });

  test('completeOnboarding delega ao serviço autenticado', async () => {
    jest.spyOn(AuthService, 'completeOnboarding').mockResolvedValue({ id: 1, tenant_id: 10, admin: true } as any);
    const req = createRequestMock({ user: { id: 1, sub: 'kc-1' }, body: { company_name: 'Operix' } });
    const res = createResponseMock();

    await AuthController.completeOnboarding(req, res);

    expect(AuthService.completeOnboarding).toHaveBeenCalledWith(req.user, { company_name: 'Operix' });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
