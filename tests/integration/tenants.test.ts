import supertest from 'supertest';
import { app } from '../../src/core/app';
import connection from '../../src/core/database/connection.js';
import jwt from 'jsonwebtoken';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';


beforeAll(() => {
  jest.spyOn(AuthMiddleware, 'verifyRawToken').mockImplementation(async (token) => {
    return { id: 1, username: 'admin', admin: true, tenant_id: 1, roles: ['module:operational', 'module:inventory', 'module:organization', 'module:notifications'] };
  });
});

beforeAll(() => {
  process.env.SECRET = 'testsecret';
});

afterEach(() => {
  jest.clearAllMocks();
});

function mockConnectWithResponses(responder: (sql: string, params: any[]) => any) {
  const query = jest.fn((sql: string, params: any[]) => {
    return Promise.resolve(responder(sql, params));
  });
  const release = jest.fn();
  (connection as any).connect = jest.fn().mockResolvedValue({ query, release });
  return { query, release };
}

describe('Testes de Integração - Rotas de Tenants', () => {
  const token = jwt.sign({ id: 1, username: 'u', admin: true, tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /tenants - requer autenticação', async () => {
    const res = await supertest(app).get('/api/tenants');
    expect(res.status).toBe(401);
  });

  test('GET /tenants - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT') && sql.includes('FROM tenants')) return { rows: [{ id: 1, name: 'Tenant A' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .get('/api/tenants')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([{ id: 1, name: 'Tenant A' }]);
    expect(res.body.msg).toBe("Unidades listadas com sucesso");
  });

  test('POST /tenants - sucesso ao criar tenant', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO tenants')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Novo Tenant' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBe(1);
    expect(res.body.msg).toBe("Unidade criada com sucesso");
  });

  test('DELETE /tenants/:id - sucesso ao remover', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('DELETE FROM tenants')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .delete('/api/tenants/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
