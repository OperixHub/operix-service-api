import supertest from 'supertest';
import { app } from '../../src/app';
import connection from '../../src/database/connection';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(() => Promise.resolve('salt')),
  hash: jest.fn(() => Promise.resolve('hashed')),
  compare: jest.fn(() => Promise.resolve(true))
}));

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

describe('Testes de Integração - Autenticação (Auth)', () => {
  test('POST /auth/register - nome de usuário ausente retorna 400', async () => {
    const res = await supertest(app)
      .post('/auth/register')
      .send({ email: 'admin@operix.com.br', password: 'adminpassword', confirmPassword: 'adminpassword', tenant_id: 1 });

    expect(res.status).toBe(400);
  });

  test('POST /auth/register - sucesso retorna 200', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.includes('WHERE email')) return { rowCount: 0, rows: [] };
      if (sql.includes('WHERE username')) return { rowCount: 0, rows: [] };
      if (sql.includes('INSERT INTO users')) return { rows: [{ id: 1, username: 'adminuser' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .post('/auth/register')
      .send({
        username: 'adminuser',
        email: 'admin@operix.com.br',
        password: 'adminpassword',
        confirmPassword: 'adminpassword',
        tenant_id: 1
      });

    expect(res.status).toBe(200);
  });

  test('POST /auth/login - senha ausente retorna 400', async () => {
    const res = await supertest(app)
      .post('/auth/login')
      .send({ username: 'adminuser' });

    expect(res.status).toBe(400);
  });

  test('POST /auth/login - sucesso retorna token e usuário', async () => {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('adminpassword', salt);

    mockConnectWithResponses((sql) => {
      if (sql.includes('users') && sql.includes('WHERE username')) {
        return { rows: [{ id: 1, username: 'adminuser', password: passwordHash, admin: false, tenant_id: 1 }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const res = await supertest(app)
      .post('/auth/login')
      .send({ username: 'adminuser', password: 'adminpassword', remember: true });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });
});
