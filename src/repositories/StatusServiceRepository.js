import statusServiceModel from "../models/StatusService.js";

class StatusServiceRepository {
  static async getAll() {
    return statusServiceModel.getAll();
  }

  static async create(data) {
    return statusServiceModel.create(data);
  }

  static async remove(id) {
    return statusServiceModel.remove(id);
  }
}

export default StatusServiceRepository;
