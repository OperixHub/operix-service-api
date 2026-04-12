// @ts-nocheck
import StatusServiceRepository from './status-service.repository.js';

class StatusServiceService {
  static async getAll(tenant_id) { return StatusServiceRepository.getAll(tenant_id); }
  static async create(status) { return StatusServiceRepository.create(status); }
  static async remove(id, tenant_id) { return StatusServiceRepository.remove(id, tenant_id); }
}

export default StatusServiceService;
