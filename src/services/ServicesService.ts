// @ts-nocheck
import ServicesRepository from "../repositories/ServicesRepository.js";

class ServicesService {
  static async getAll() {
    return ServicesRepository.getAll();
  }

  static async getAllWharehouse() {
    return ServicesRepository.getAllWharehouse();
  }

  static async create(data: any) {
    return ServicesRepository.create(data);
  }

  static async updateWarehouse(id, value, typeTable) {
    return ServicesRepository.updateWarehouse(id, value, typeTable);
  }

  static async updateInfoClient(id, info) {
    return ServicesRepository.updateInfoClient(id, info);
  }

  static async updateStatusService(id, status, typeTable) {
    return ServicesRepository.updateStatusService(id, status, typeTable);
  }

  static async updateStatusPayment(id, status, typeTable) {
    return ServicesRepository.updateStatusPayment(id, status, typeTable);
  }

  static async remove(id, cod, typeTable: any) {
    return ServicesRepository.remove(id, cod, typeTable);
  }
}

export default ServicesService;
