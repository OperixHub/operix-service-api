// @ts-nocheck
import StatusPaymentRepository from './status-payment.repository.js';

class StatusPaymentService {
  static async getAll(tenant_id) { return StatusPaymentRepository.getAll(tenant_id); }
  static async create(status) { return StatusPaymentRepository.create(status); }
  static async remove(id, tenant_id) { return StatusPaymentRepository.remove(id, tenant_id); }
}

export default StatusPaymentService;
