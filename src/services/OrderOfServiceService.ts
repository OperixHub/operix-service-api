// @ts-nocheck
import OrderOfServiceRepository from "../repositories/OrderOfServiceRepository.js";

class OrderOfServiceService {
  static async getAll() {
    return OrderOfServiceRepository.getAll();
  }

  static async getUnique(cod) {
    return OrderOfServiceRepository.getUnique(cod);
  }

  static async updateEstimate(estimateArray, totalPrice, cod) {
    return OrderOfServiceRepository.updateEstimate(estimateArray, totalPrice, cod);
  }

  static async removeEstimate(cod, idEstimate) {
    return OrderOfServiceRepository.removeEstimate(cod, idEstimate);
  }

  static async removeEstimateSimple(cod, id) {
    return OrderOfServiceRepository.removeEstimateSimple(cod, id);
  }
}

export default OrderOfServiceService;
