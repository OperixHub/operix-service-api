import TenantPolicyService from '../../src/core/profile/tenants/tenant-policy.service.js';
import TenantRepository from '../../src/core/profile/tenants/tenants.repository.js';
import { env } from '../../src/core/config/env.js';

describe('TenantPolicyService', () => {
  const originalMode = env.deploymentMode;

  afterEach(() => {
    env.deploymentMode = originalMode;
    jest.restoreAllMocks();
  });

  test('bloqueia criação de tenant em modo LOCAL quando já existe tenant', async () => {
    env.deploymentMode = 'LOCAL';
    jest.spyOn(TenantRepository, 'count').mockResolvedValue(1);

    await expect(TenantPolicyService.assertTenantCanBeCreated()).rejects.toThrow('instância local já foi configurada');
  });

  test('permite criação de múltiplos tenants em modo SAAS', async () => {
    env.deploymentMode = 'SAAS';
    jest.spyOn(TenantRepository, 'count').mockResolvedValue(3);

    await expect(TenantPolicyService.assertTenantCanBeCreated()).resolves.toBeUndefined();
  });

  test('expõe estado público para bloquear cadastro visual em LOCAL configurado', async () => {
    env.deploymentMode = 'LOCAL';
    jest.spyOn(TenantRepository, 'count').mockResolvedValue(1);

    await expect(TenantPolicyService.getPublicState()).resolves.toEqual(expect.objectContaining({
      deployment_mode: 'LOCAL',
      registration_enabled: false,
      local_instance_configured: true,
    }));
  });
});
