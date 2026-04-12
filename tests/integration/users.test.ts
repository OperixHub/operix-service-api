import supertest from 'supertest';
import { app } from '../../src/core/app';
import connection from '../../src/core/database/connection.js';
import jwt from 'jsonwebtoken';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';

import * as argon2 from 'argon2';


const fakeArgon2Hash = '$argon2id$v=19$m=65536,t=3,p=4$saltsalt$hashhashhashhashhashhashhashhash';
jest.mock('argon2', () => ({
  hash: jest.fn(() => Promise.resolve(fakeArgon2Hash)),
  verify: jest.fn((hash, password) => Promise.resolve(
    hash.startsWith('$argon2id$') && password === 'adminpassword'
  ))
}));


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
    const response = responder(sql, params);
    return Promise.resolve(response);
  });
  const release = jest.fn();
  (connection as any).connect = jest.fn().mockResolvedValue({ query, release });
  return { query, release };
}

describe('Testes de Integração - Rotas de Usuários Management', () => {
  test('GET /users - requer autenticação', async () => {
    const res = await supertest(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('GET /users - autorizado retorna lista de usuários no campo data', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('SELECT') && sql.includes('FROM users')) {
        return { rows: [{ id: 1, username: 'adminuser' }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const token = jwt.sign({ id: 1, username: 'adminuser', admin: false, tenant_id: 1 }, process.env.SECRET as string, { expiresIn: '1d' });

    const res = await supertest(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([{ id: 1, username: 'adminuser' }]);
    expect(res.body.msg).toBe("Usuários listados com sucesso");
  });

  test('DELETE /users/:id - usuário não encontrado', async () => {
    mockConnectWithResponses(() => {
      return { rows: [], rowCount: 0 };
    });
    const token = jwt.sign({ id: 1, username: 'adminuser', admin: false, tenant_id: 1 }, process.env.SECRET as string, { expiresIn: '1d' });

    const res = await supertest(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Usuário não encontrado.");
  });

  test('DELETE /users/:id - administrador não pode ser removido', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('FROM users WHERE id =')) return { rows: [{ admin: true }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const token = jwt.sign({ id: 1, username: 'adminuser', admin: true, tenant_id: 1 }, process.env.SECRET as string, { expiresIn: '1d' });

    const res = await supertest(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.msg).toBe("Usuário administrador não pode ser removido.");
  });

  test('DELETE /users/:id - sucesso retorna 204', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('FROM users WHERE id =')) return { rows: [{ admin: false }], rowCount: 1 };
      if (sql.startsWith('DELETE')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const token = jwt.sign({ id: 1, username: 'adminuser', admin: false, tenant_id: 1 }, process.env.SECRET as string, { expiresIn: '1d' });

    const res = await supertest(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
