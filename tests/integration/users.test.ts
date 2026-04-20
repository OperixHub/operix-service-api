import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/core/app';
import connection from '../../src/core/database/connection.js';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';

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

function mockConnectWithResponses(responder: (sql: string, params: any[]) => any) {
  const query = jest.fn((sql: string, params: any[]) => Promise.resolve(responder(sql, params)));
  const release = jest.fn();
  (connection as any).connect = jest.fn().mockResolvedValue({ query, release });
  return { query, release };
}

describe('Testes de IntegraÃ§Ã£o - Rotas de UsuÃ¡rios', () => {
  const token = jwt.sign({ id: 1, username: 'adminuser', tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /api/identity/users - requer autenticaÃ§Ã£o', async () => {
    const res = await supertest(app).get('/api/identity/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/identity/users - retorna lista de usuÃ¡rios do tenant', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT id, username, email, tenant_id, admin, root FROM users')) {
        return { rows: [{ id: 1, username: 'adminuser', email: 'admin@operix.dev', tenant_id: 1, admin: true, root: true }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .get('/api/identity/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe('UsuÃ¡rios listados com sucesso');
    expect(res.body.data).toEqual([{ id: 1, username: 'adminuser', email: 'admin@operix.dev', tenant_id: 1, admin: true, root: true }]);
  });

  test('DELETE /api/identity/users/:id - usuÃ¡rio nÃ£o encontrado', async () => {
    mockConnectWithResponses(() => ({ rows: [], rowCount: 0 }));

    const res = await supertest(app)
      .delete('/api/identity/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe('UsuÃ¡rio nÃ£o encontrado.');
  });

  test('DELETE /api/identity/users/:id - administrador nÃ£o pode ser removido', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT * FROM users WHERE id = $1 AND tenant_id = $2')) {
        return { rows: [{ admin: true }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .delete('/api/identity/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe('UsuÃ¡rio administrador nÃ£o pode ser removido.');
  });

  test('DELETE /api/identity/users/:id - sucesso retorna 204 sem body', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT * FROM users WHERE id = $1 AND tenant_id = $2')) {
        return { rows: [{ admin: false }], rowCount: 1 };
      }
      if (sql.startsWith('DELETE FROM users')) {
        return { rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .delete('/api/identity/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });
});
