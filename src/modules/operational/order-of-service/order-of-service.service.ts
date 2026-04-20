// @ts-nocheck
import OrderOfServiceRepository from './order-of-service.repository.js';
import ValidationError from '../../../core/utils/validation-error.js';

class OrderOfServiceService {
  static async getAll(tenant_id) { return OrderOfServiceRepository.getAll(tenant_id); }

  static async getUnique(cod, tenant_id) {
    const order = await OrderOfServiceRepository.getUnique(cod, tenant_id);
    if (!order || order.length === 0) throw new ValidationError('Ordem de serviÃ§o nÃ£o encontrada', 404);
    return order;
  }

  static async updateEstimate(estimateArray, totalPrice, cod, tenant_id) { return OrderOfServiceRepository.updateEstimate(estimateArray, totalPrice, cod, tenant_id); }
  static async removeEstimate(cod, tenant_id, idEstimate) { return OrderOfServiceRepository.removeEstimate(cod, tenant_id, idEstimate); }
  static async removeEstimateSimple(cod, tenant_id) { return OrderOfServiceRepository.removeEstimateSimple(cod, tenant_id); }
}

export default OrderOfServiceService;
