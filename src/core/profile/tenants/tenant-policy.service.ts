import connection from '../../database/connection.js';
import { env, isLocalDeployment } from '../../config/env.js';
import ValidationError from '../../utils/validation-error.js';
import TenantRepository from './tenants.repository.js';

const TENANT_PROVISIONING_LOCK_KEY = 2026050601;

export default class TenantPolicyService {
  static get deploymentMode() {
    return env.deploymentMode;
  }

  static async getPublicState() {
    const tenantCount = await TenantRepository.count();
    return {
      deployment_mode: env.deploymentMode,
      tenant_count: tenantCount,
      registration_enabled: !isLocalDeployment() || tenantCount === 0,
      onboarding_enabled: !isLocalDeployment() || tenantCount === 0,
      local_instance_configured: isLocalDeployment() && tenantCount > 0,
    };
  }

  static async assertTenantCanBeCreated() {
    if (!isLocalDeployment()) {
      return;
    }

    const tenantCount = await TenantRepository.count();
    if (tenantCount > 0) {
      throw new ValidationError('Esta instância local já foi configurada. Novos cadastros de empresa estão bloqueados.', 409);
    }
  }

  static async withTenantProvisioningLock<T>(callback: () => Promise<T>): Promise<T> {
    const connect = await connection.connect();

    try {
      await connect.query('SELECT pg_advisory_lock($1)', [TENANT_PROVISIONING_LOCK_KEY]);
      return await callback();
    } finally {
      await connect.query('SELECT pg_advisory_unlock($1)', [TENANT_PROVISIONING_LOCK_KEY]);
      connect.release();
    }
  }
}
