import ValidationError from '../../utils/validation-error.js';
import KeycloakAdminService from '../../auth/keycloak-admin.service.js';
import TenantModel from './tenants.model.js';
import TenantsRepository from './tenants.repository.js';
import TenantPolicyService from './tenant-policy.service.js';

class TenantsService {
  static async getAll() {
    return TenantsRepository.getAll();
  }

  static async create(tenant: TenantModel) {
    return TenantPolicyService.withTenantProvisioningLock(async () => {
      await TenantPolicyService.assertTenantCanBeCreated();

      const tenantName = tenant.name.trim();
      const existingTenant = await TenantsRepository.findByName(tenantName);
      if (existingTenant) {
        throw new ValidationError('Unidade já cadastrada.', 409);
      }

      const adminToken = await KeycloakAdminService.getAdminToken();
      const { groupId, created } = await KeycloakAdminService.ensureGroupExists(tenantName, adminToken);

      try {
        return await TenantsRepository.create(TenantModel.fromRequest({
          name: tenantName,
          keycloak_group_id: groupId,
          cnpj: tenant.cnpj,
          description: tenant.description,
        }));
      } catch (error) {
        if (created) {
          await KeycloakAdminService.deleteGroup(groupId, adminToken);
        }
        throw error;
      }
    });
  }

  static async remove(id: number) {
    const isRemoved = await TenantsRepository.remove(id);
    if (!isRemoved) {
      throw new ValidationError('Unidade não encontrada.', 404);
    }
    return true;
  }

  static async update(id: number | null | undefined, tenant: TenantModel) {
    if (!id) {
      throw new ValidationError('Tenant do usuário autenticado não encontrado.', 422);
    }

    const existingTenant = await TenantsRepository.findById(id);
    if (!existingTenant) {
      throw new ValidationError('Unidade não encontrada.', 404);
    }

    const tenantName = tenant.name?.trim();
    if (tenantName && tenantName.toLowerCase() !== existingTenant.name.toLowerCase()) {
      const tenantByName = await TenantsRepository.findByName(tenantName);
      if (tenantByName && tenantByName.id !== id) {
        throw new ValidationError('Unidade já cadastrada.', 409);
      }
    }

    return TenantsRepository.update(id, {
      name: tenantName || existingTenant.name,
      cnpj: tenant.cnpj ?? existingTenant.cnpj,
      description: tenant.description ?? existingTenant.description,
      logo_url: tenant.logo_url ?? existingTenant.logo_url,
      enabled_modules: tenant.enabled_modules ?? existingTenant.enabled_modules,
    });
  }
}

export default TenantsService;
