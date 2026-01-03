import OrderOfServiceRepository from "../repositories/OrderOfServiceRepository.js";

class OrderOfServiceService {
  static async getAll() {
    return OrderOfServiceRepository.getAll();
  }

  static async getUnique(cod) {
    return OrderOfServiceRepository.getUnique(cod);
  }

  static async updateEstimate(cod, data) {
    return OrderOfServiceRepository.updateEstimate(cod, data);
  }

  static async removeEstimate(cod, idEstimate) {
    return OrderOfServiceRepository.removeEstimate(cod, idEstimate);
  }
}

export default OrderOfServiceService;
