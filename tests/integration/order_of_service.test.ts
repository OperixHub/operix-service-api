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

describe('Testes de Integração - Rotas de Ordem de Serviço (Order of Service)', () => {
  const token = jwt.sign({ id: 1, username: 'admin', admin: true, tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /order_of_service/ - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      return { rows: [{ id: 1, cod: 'OS123' }], rowCount: 1 };
    });

    const res = await supertest(app)
      .get('/api/order-of-service/')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Ordens de serviço listadas com sucesso");
  });

  test('GET /order_of_service/:cod - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      return { rows: [{ id: 1, cod: 'OS123' }], rowCount: 1 };
    });

    const res = await supertest(app)
      .get('/api/order-of-service/OS123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Ordem de serviço detalhada com sucesso");
  });

  test('PUT /order_of_service/estimate/:cod - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('FROM order_of_service')) {
        return { rows: [{ id: 1, cod: 'OS123', estimate: '[]' }], rowCount: 1 };
      }
      return { rowCount: 1 };
    });

    const res = await supertest(app)
      .put('/api/order-of-service/estimate/OS123')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'New estimate',
        price: 50,
        amount: 1,
        type: 'completa'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /order_of_service/estimate/:cod/:idEstimate - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT')) return { rows: [{ id: 1, cod: 'OS123', estimate: '[{"id":1, "price":50}]' }], rowCount: 1 };
      return { rowCount: 1 };
    });

    const res = await supertest(app)
      .delete('/api/order-of-service/estimate/OS123/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
