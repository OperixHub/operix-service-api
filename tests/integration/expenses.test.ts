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

describe('Testes de Integração - Rotas de Despesas (Expenses)', () => {
  const token = jwt.sign({ id: 1, username: 'admin', admin: true, tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /expenses - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT * FROM expenses')) return { rows: [{ id: 1, description: 'Lunch' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .get('/expenses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, description: 'Lunch' }]);
  });

  test('POST /expenses - sucesso ao criar', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO expenses')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .post('/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Internet bill',
        value: 100,
        date: '2023-10-10'
      });

    expect(res.status).toBe(201);
  });

  test('DELETE /expenses/:id - sucesso ao remover', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('DELETE FROM expenses')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .delete('/expenses/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
