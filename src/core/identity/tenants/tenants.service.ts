import ValidationError from '../../utils/validation-error.js';
import KeycloakAdminService from '../../auth/keycloak-admin.service.js';
import TenantModel from './tenants.model.js';
import TenantsRepository from './tenants.repository.js';

class TenantsService {
  static async getAll() {
    return TenantsRepository.getAll();
  }

  static async create(tenant: TenantModel) {
    const tenantName = tenant.name.trim();
    const existingTenant = await TenantsRepository.findByName(tenantName);
    if (existingTenant) {
      throw new ValidationError('Unidade jÃ¡ cadastrada.', 409);
    }

    const adminToken = await KeycloakAdminService.getAdminToken();
    const { groupId, created } = await KeycloakAdminService.ensureGroupExists(tenantName, adminToken);

    try {
      return await TenantsRepository.create(TenantModel.fromRequest({
        name: tenantName,
        keycloak_group_id: groupId,
      }));
    } catch (error) {
      if (created) {
        await KeycloakAdminService.deleteGroup(groupId, adminToken);
      }
      throw error;
    }
  }

  static async remove(id: number) {
    const isRemoved = await TenantsRepository.remove(id);
    if (!isRemoved) {
      throw new ValidationError('Unidade nÃ£o encontrada.', 404);
    }
    return true;
  }
}

export default TenantsService;
