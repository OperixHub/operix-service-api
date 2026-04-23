import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/core/app';
import connection from '../../src/core/database/connection.js';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';
import UsersService from '../../src/core/identity/users/users.service.js';

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

function mockConnectWithResponses(responder: (sql: string, params: any[]) => any) {
  const query = jest.fn((sql: string, params: any[]) => Promise.resolve(responder(sql, params)));
  const release = jest.fn();
  (connection as any).connect = jest.fn().mockResolvedValue({ query, release });
  return { query, release };
}

describe('Testes de Integração - Rotas de Usuários', () => {
  const token = jwt.sign({ id: 1, username: 'adminuser', tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /api/users - requer autenticação', async () => {
    const res = await supertest(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/users - retorna lista de usuários do tenant', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT id, name, username, email, tenant_id, admin, root FROM users')) {
        return { rows: [{ id: 1, name: 'Admin User', username: 'adminuser', email: 'admin@operix.dev', tenant_id: 1, admin: true, root: true }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe('Usuários listados com sucesso');
    expect(res.body.data).toEqual([{ id: 1, name: 'Admin User', username: 'adminuser', email: 'admin@operix.dev', tenant_id: 1, admin: true, root: true }]);
  });

  test('POST /api/users - cria usuário no tenant autenticado', async () => {
    jest.spyOn(UsersService, 'create').mockResolvedValue({
      id: 22,
      name: 'Maria Lima',
      username: 'maria',
      email: 'maria@operix.dev',
      tenant_id: 1,
      admin: false,
      root: false,
    } as any);

    const res = await supertest(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Maria Lima',
        username: 'maria',
        email: 'maria@operix.dev',
        password: '12345678',
        modules: ['operational', 'inventory'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe('Usuário criado com sucesso');
    expect(res.body.data).toEqual({
      id: 22,
      name: 'Maria Lima',
      username: 'maria',
      email: 'maria@operix.dev',
      tenant_id: 1,
      admin: false,
      root: false,
    });
  });

  test('DELETE /api/users/:id - usuário não encontrado', async () => {
    mockConnectWithResponses(() => ({ rows: [], rowCount: 0 }));

    const res = await supertest(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe('Usuário não encontrado.');
  });

  test('DELETE /api/users/:id - administrador não pode ser removido', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT * FROM users WHERE id = $1 AND tenant_id = $2')) {
        return { rows: [{ admin: true }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe('Usuário administrador não pode ser removido.');
  });

  test('DELETE /api/users/:id - sucesso retorna 204 sem body', async () => {
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
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });
});
