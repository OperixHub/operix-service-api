// @ts-nocheck
import orderOfServiceModel from "../models/OrderOfService.js";

class OrderOfServiceRepository {
  static async getAll() {
    return orderOfServiceModel.getAll();
  }

  static async getUnique(cod) {
    return orderOfServiceModel.getUnique(cod);
  }

  static async updateEstimate(cod, data) {
    return orderOfServiceModel.updateEstimate(cod, data);
  }

  static async removeEstimate(cod, idEstimate) {
    return orderOfServiceModel.removeEstimate(cod, idEstimate);
  }

  static async removeEstimateSimple(cod, id) {
    return orderOfServiceModel.removeEstimateSimple(cod, id);
  }
}

export default OrderOfServiceRepository;
