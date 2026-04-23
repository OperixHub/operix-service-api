import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/core/app';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';
import TenantsService from '../../src/core/identity/tenants/tenants.service.js';

beforeAll(() => {
  jest.spyOn(AuthMiddleware, 'verifyRawToken').mockImplementation(async () => ({
    id: 1,
    username: 'admin',
    admin: true,
    tenant_id: 1,
    roles: ['module:operational', 'module:inventory', 'module:organization', 'module:notifications'],
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Testes de Integração - Rotas de Tenants', () => {
  const token = jwt.sign({ id: 1, username: 'admin', tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /api/identity/tenants - requer autenticação', async () => {
    const res = await supertest(app).get('/api/identity/tenants');
    expect(res.status).toBe(401);
  });

  test('GET /api/identity/tenants - sucesso', async () => {
    jest.spyOn(TenantsService, 'getAll').mockResolvedValue([{ id: 1, name: 'Tenant A', keycloak_group_id: 'group-1' } as any]);

    const res = await supertest(app)
      .get('/api/identity/tenants')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([{ id: 1, name: 'Tenant A', keycloak_group_id: 'group-1' }]);
    expect(res.body.msg).toBe('Unidades listadas com sucesso');
  });

  test('POST /api/identity/tenants - sucesso ao criar tenant', async () => {
    jest.spyOn(TenantsService, 'create').mockResolvedValue({ id: 10, name: 'Novo Tenant', keycloak_group_id: 'group-10' } as any);

    const res = await supertest(app)
      .post('/api/identity/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Novo Tenant' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ id: 10, name: 'Novo Tenant', keycloak_group_id: 'group-10' });
    expect(res.body.msg).toBe('Unidade criada com sucesso');
  });

  test('DELETE /api/identity/tenants/:id - sucesso ao remover', async () => {
    jest.spyOn(TenantsService, 'remove').mockResolvedValue(true as never);

    const res = await supertest(app)
      .delete('/api/identity/tenants/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });
});
