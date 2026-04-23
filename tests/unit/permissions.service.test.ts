import PermissionsService from '../../src/core/profile/permissions/permissions.service.js';

describe('PermissionsService', () => {
  test('resolve permissões a partir das roles', () => {
    const snapshot = PermissionsService.buildPermissionSnapshot({
      roles: ['module:inventory'],
      overrides: [],
    });

    expect(snapshot.effective_permissions).toContain('dashboard.access');
    expect(snapshot.effective_permissions).toContain('inventory.stock.access');
  });

  test('allow explícito libera permissão sem role base', () => {
    const snapshot = PermissionsService.buildPermissionSnapshot({
      roles: [],
      overrides: [{ permission_key: 'organization.users.access', effect: 'allow' }],
    });

    expect(snapshot.effective_permissions).toContain('organization.users.access');
  });

  test('deny explícito bloqueia permissão mesmo com role base', () => {
    const snapshot = PermissionsService.buildPermissionSnapshot({
      roles: ['module:inventory'],
      overrides: [{ permission_key: 'inventory.stock.access', effect: 'deny' }],
    });

    expect(snapshot.effective_permissions).not.toContain('inventory.stock.access');
  });

  test('catálogo contém módulos gerenciáveis', () => {
    const catalog = PermissionsService.getCatalog();
    expect(catalog.modules.some((module) => module.key === 'operational')).toBe(true);
    expect(catalog.permissions.some((permission) => permission.key === 'dashboard.access')).toBe(true);
  });
});
