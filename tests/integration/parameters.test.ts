import supertest from 'supertest';
import { app } from '../../src/core/app';
import connection from '../../src/core/database/connection.js';
import jwt from 'jsonwebtoken';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';

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
  jest.spyOn(AuthMiddleware, 'verifyRawToken').mockImplementation(async (token) => {
    return { id: 1, username: 'admin', admin: true, tenant_id: 1, roles: ['module:operational', 'module:inventory', 'module:organization', 'module:notifications'], permissions };
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

describe('Testes de Integração - Rotas de Parâmetros (Status e Tipos)', () => {
  const token = jwt.sign({ id: 1, username: 'admin', admin: true, tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  // Status Payment
  test('GET /status_payment - sucesso', async () => {
    mockConnectWithResponses(() => ({ rows: [{ id: 1, status: 'Paid' }], rowCount: 1 }));
    const res = await supertest(app).get('/api/status-payment').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Status de pagamento listados com sucesso");
  });

  test('POST /status_payment - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO status_payment')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const res = await supertest(app).post('/api/status-payment').set('Authorization', `Bearer ${token}`).send({ description: 'Pending', cod: 1, color: '#000' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Status de pagamento criado com sucesso");
  });

  // Status Service
  test('GET /status_service - sucesso', async () => {
    mockConnectWithResponses(() => ({ rows: [{ id: 1, status: 'In Progress' }], rowCount: 1 }));
    const res = await supertest(app).get('/api/status-service').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Status de serviço listados com sucesso");
  });

  test('POST /status_service - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO status_service')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const res = await supertest(app).post('/api/status-service').set('Authorization', `Bearer ${token}`).send({ description: 'Done', color: '#000' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Status de serviço criado com sucesso");
  });

  // Types Product
  test('GET /types_product - sucesso', async () => {
    mockConnectWithResponses(() => ({ rows: [{ id: 1, type: 'Electronics' }], rowCount: 1 }));
    const res = await supertest(app).get('/api/types-product').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Tipos de produto listados com sucesso");
  });

  test('POST /types_product - sucesso', async () => {
    mockConnectWithResponses((sql) => {
      if (sql.startsWith('INSERT INTO types_product')) return { rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const res = await supertest(app).post('/api/types-product').set('Authorization', `Bearer ${token}`).send({ name: 'Grocery' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.msg).toBe("Tipo de produto criado com sucesso");
  });
});
