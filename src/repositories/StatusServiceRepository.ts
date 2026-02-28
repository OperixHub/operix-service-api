// @ts-nocheck
import statusServiceModel from "../models/StatusService.js";

class StatusServiceRepository {
  static async getAll() {
    return statusServiceModel.getAll();
  }

  static async create(data: any) {
    return statusServiceModel.create(data);
  }

  static async remove(id: any) {
    return statusServiceModel.remove(id);
  }
}

export default StatusServiceRepository;
