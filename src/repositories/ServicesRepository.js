import servicesModel from "../models/Services.js";

class ServicesRepository {
  static async reloadSocketData(typeTable) {
    return servicesModel.reloadSocketData(typeTable);
  }

  static async getAllPaid() {
    return servicesModel.getAllPaid();
  }

  static async getAllNotConcluded() {
    return servicesModel.getAllNotConcluded();
  }

  static async getAll() {
    return servicesModel.getAll();
  }

  static async getAllWharehouse() {
    return servicesModel.getAllWharehouse();
  }

  static async create(service) {
    return servicesModel.create(service);
  }

  static async updateWarehouse(id, value, typeTable) {
    return servicesModel.updateWarehouse(id, value, typeTable);
  }

  static async updateInfoClient(id, info) {
    return servicesModel.updateInfoClient(id, info);
  }

  static async updateStatusService(id, status, typeTable) {
    return servicesModel.updateStatusService(id, status, typeTable);
  }

  static async updateStatusPayment(id, status, typeTable) {
    return servicesModel.updateStatusPayment(id, status, typeTable);
  }

  static async remove(id, cod_order, typeTable) {
    return servicesModel.remove(id, cod_order, typeTable);
  }

  static async getCountProductByService(data) {
    return servicesModel.getCountProductByService(data);
  }
}

export default ServicesRepository;
