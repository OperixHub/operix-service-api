import supertest from 'supertest';
import { app } from '../../src/app';
import connection from '../../src/database/connection';
import jwt from 'jsonwebtoken';

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
      .get('/order_of_service/')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('GET /order_of_service/:cod - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      return { rows: [{ id: 1, cod: 'OS123' }], rowCount: 1 };
    });

    const res = await supertest(app)
      .get('/order_of_service/OS123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('PUT /order_of_service/estimate/:cod - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      return { rowCount: 1 };
    });

    const res = await supertest(app)
      .put('/order_of_service/estimate/OS123')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'New estimate',
        value: 50
      });

    expect(res.status).toBe(200);
  });

  test('DELETE /order_of_service/estimate/:cod/:idEstimate - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      return { rowCount: 1 };
    });

    const res = await supertest(app)
      .delete('/order_of_service/estimate/OS123/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
