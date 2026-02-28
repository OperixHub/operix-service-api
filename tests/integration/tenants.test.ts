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

describe('Testes de Integração - Rotas de Tenants', () => {
  const token = jwt.sign({ id: 1, username: 'u', admin: true }, 'testsecret', { expiresIn: '1d' });

  test('GET /tenants - requer autenticação', async () => {
    const res = await supertest(app).get('/tenants');
    expect(res.status).toBe(401);
  });

  test('GET /tenants - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT * FROM tenants')) return { rows: [{ id: 1, name: 'Tenant A' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .get('/tenants')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: 'Tenant A' }]);
  });

  test('POST /tenants - sucesso ao criar tenant', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO tenants')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .post('/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Novo Tenant' });

    expect(res.status).toBe(201);
    expect(res.body).toBe(1); // the repository returns rowCount
  });

  test('DELETE /tenants/:id - sucesso ao remover', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('DELETE FROM tenants')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .delete('/tenants/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
