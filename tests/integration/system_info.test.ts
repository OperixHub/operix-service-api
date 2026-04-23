import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/core/app';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';
import SystemInfoService from '../../src/modules/notifications/system-info/system-info.service.js';

const permissions = [
  'dashboard.access',
  'operational.services.access',
  'operational.status.access',
  'operational.types-products.access',
  'inventory.stock.access',
  'organization.users.access',
  'organization.tenants.access',
  'notifications.system-info.access',
];

beforeAll(() => {
  jest.spyOn(AuthMiddleware, 'verifyRawToken').mockImplementation(async () => ({
    id: 1,
    username: 'admin',
    admin: true,
    tenant_id: 1,
    roles: ['module:operational', 'module:inventory', 'module:organization', 'module:notifications'],
    permissions,
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Testes de Integração - Rotas de Informações do Sistema', () => {
  const token = jwt.sign({ id: 1, username: 'admin', tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /api/system-info - requer autenticação', async () => {
    const res = await supertest(app).get('/api/system-info');
    expect(res.status).toBe(401);
  });

  test('GET /api/system-info - sucesso', async () => {
    jest.spyOn(SystemInfoService, 'getSystemInfo').mockResolvedValue([{ id: 1, title: 'Serviço antigo' } as any]);

    const res = await supertest(app)
      .get('/api/system-info')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([{ id: 1, title: 'Serviço antigo' }]);
    expect(res.body.msg).toBe('Informações do sistema obtidas com sucesso');
  });
});
