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

describe('Testes de Integração - Rotas de Parâmetros (Status e Tipos)', () => {
  const token = jwt.sign({ id: 1, username: 'admin', admin: true, tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  // Status Payment
  test('GET /status_payment - sucesso', async () => {
    mockConnectWithResponses(() => ({ rows: [{ id: 1, status: 'Paid' }], rowCount: 1 }));
    const res = await supertest(app).get('/status_payment').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('POST /status_payment - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO status_payment')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const res = await supertest(app).post('/status_payment').set('Authorization', `Bearer ${token}`).send({ status: 'Pending' });
    expect(res.status).toBe(201);
  });

  // Status Service
  test('GET /status_service - sucesso', async () => {
    mockConnectWithResponses(() => ({ rows: [{ id: 1, status: 'In Progress' }], rowCount: 1 }));
    const res = await supertest(app).get('/status_service').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('POST /status_service - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO status_service')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const res = await supertest(app).post('/status_service').set('Authorization', `Bearer ${token}`).send({ status: 'Done' });
    expect(res.status).toBe(201);
  });

  // Types Product
  test('GET /types_product - sucesso', async () => {
    mockConnectWithResponses(() => ({ rows: [{ id: 1, type: 'Electronics' }], rowCount: 1 }));
    const res = await supertest(app).get('/types_product').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('POST /types_product - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO types_product')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const res = await supertest(app).post('/types_product').set('Authorization', `Bearer ${token}`).send({ type: 'Grocery' });
    expect(res.status).toBe(201);
  });
});
