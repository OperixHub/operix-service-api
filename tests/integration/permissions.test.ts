import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/core/app';
import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';
import PermissionsRepository from '../../src/core/permissions/permissions.repository.js';
import UsersRepository from '../../src/core/identity/users/users.repository.js';
import KeycloakAdminService from '../../src/core/auth/keycloak-admin.service.js';

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
    name: 'Admin',
    username: 'admin',
    email: 'admin@operix.dev',
    admin: true,
    tenant_id: 1,
    roles: ['module:operational', 'module:inventory', 'module:organization', 'module:notifications'],
    permissions,
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Testes de Integração - Permissões', () => {
  const token = jwt.sign({ id: 1, username: 'admin', tenant_id: 1 }, 'testsecret', { expiresIn: '1d' });

  test('GET /api/permissions/me - retorna permissões efetivas', async () => {
    jest.spyOn(PermissionsRepository, 'getOverridesByUserId').mockResolvedValue([]);

    const res = await supertest(app)
      .get('/api/permissions/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.effective_permissions).toContain('organization.users.access');
  });

  test('GET /api/permissions/catalog - retorna catálogo agrupado', async () => {
    const res = await supertest(app)
      .get('/api/permissions/catalog')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.modules.some((module: any) => module.key === 'organization')).toBe(true);
  });

  test('GET /api/permissions/users/:id - retorna overrides e permissões do usuário', async () => {
    jest.spyOn(UsersRepository, 'findByIdAndTenantId').mockResolvedValue({
      id: 2,
      name: 'Maria',
      username: 'maria',
      email: 'maria@operix.dev',
      tenant_id: 1,
      keycloak_id: 'kc-2',
      admin: false,
      root: false,
    } as any);
    jest.spyOn(PermissionsRepository, 'getOverridesByUserId').mockResolvedValue([
      { permission_key: 'inventory.stock.access', effect: 'deny' },
    ] as any);
    jest.spyOn(KeycloakAdminService, 'getUserRealmRoleNames').mockResolvedValue(['module:inventory']);

    const res = await supertest(app)
      .get('/api/permissions/users/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overrides).toEqual([{ permission_key: 'inventory.stock.access', effect: 'deny' }]);
    expect(res.body.data.effective_permissions).not.toContain('inventory.stock.access');
  });

  test('PUT /api/permissions/users/:id - substitui overrides', async () => {
    jest.spyOn(UsersRepository, 'findByIdAndTenantId').mockResolvedValue({
      id: 2,
      name: 'Maria',
      username: 'maria',
      email: 'maria@operix.dev',
      tenant_id: 1,
      keycloak_id: 'kc-2',
      admin: false,
      root: false,
    } as any);
    jest.spyOn(PermissionsRepository, 'replaceOverrides').mockResolvedValue([] as never);
    jest.spyOn(PermissionsRepository, 'getOverridesByUserId').mockResolvedValue([
      { permission_key: 'inventory.stock.access', effect: 'allow' },
    ] as any);
    jest.spyOn(KeycloakAdminService, 'getUserRealmRoleNames').mockResolvedValue([]);

    const res = await supertest(app)
      .put('/api/permissions/users/2')
      .set('Authorization', `Bearer ${token}`)
      .send({
        overrides: [{ permission_key: 'inventory.stock.access', effect: 'allow' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.effective_permissions).toContain('inventory.stock.access');
  });
});
