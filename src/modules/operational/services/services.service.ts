// @ts-nocheck
import ServicesRepository from './services.repository.js';
import Utils from '../../../core/utils/utils.js';

class ServicesService {
  static async getAll(tenant_id) { return ServicesRepository.getAll(tenant_id); }
  static async getAllWharehouse(tenant_id) { return ServicesRepository.getAllWharehouse(tenant_id); }
  static async getNotConcluded(tenant_id) { return ServicesRepository.getAllNotConcluded(tenant_id); }

  static async create(service) {
    const created_at = Utils.generateDateLocale();
    service.created_at = created_at;
    return ServicesRepository.create(service);
  }

  static async updateWarehouse(id, tenant_id, value, typeTable) { return ServicesRepository.updateWarehouse(id, tenant_id, value, typeTable); }
  static async updateInfoClient(id, tenant_id, info) { return ServicesRepository.updateInfoClient(id, tenant_id, info); }
  static async updateStatusService(id, tenant_id, status, typeTable) { return ServicesRepository.updateStatusService(id, tenant_id, status, typeTable); }
  static async updateStatusPayment(id, tenant_id, status, typeTable) { return ServicesRepository.updateStatusPayment(id, tenant_id, status, typeTable); }
  static async remove(id, tenant_id, cod, typeTable) { return ServicesRepository.remove(id, tenant_id, cod, typeTable); }
}

export default ServicesService;

// API pÃºblica do mÃ³dulo â€” usado por notifications
export { ServicesService as ServicesQueryService };
