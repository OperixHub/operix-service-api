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

describe('Testes de IntegraÃ§Ã£o - Rotas de Estoque (Stock)', () => {
  const token = jwt.sign({ id: 1, username: 'admin', admin: true, tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /stocks - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT') && sql.includes('FROM stocks')) return { rows: [{ id: 1, name: 'PeÃ§a A', quantity: 10 }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .get('/api/stock')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Estoque listado com sucesso");
  });

  test('POST /stocks - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('INSERT INTO stocks')) return { rows: [{ id: 2, name: 'PeÃ§a B', quantity: 5 }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .post('/api/stock')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'PeÃ§a B', code: 'PB001', quantity: 5, purchasePrice: 10, salePrice: 20 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Item de estoque criado com sucesso");
  });

  test('PUT /stocks/:id - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('UPDATE stocks')) return { rows: [{ id: 1, name: 'PeÃ§a A', quantity: 15 }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .put('/api/stock/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'PeÃ§a A', code: 'PA001', quantity: 15, purchasePrice: 12, salePrice: 22 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Item de estoque atualizado com sucesso");
  });

  test('DELETE /stocks/:id - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('DELETE FROM stocks')) return { rows: [{ id: 1, name: 'PeÃ§a A' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .delete('/api/stock/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Item de estoque removido com sucesso");
  });
});
