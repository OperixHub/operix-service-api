// @ts-nocheck
import StatusServiceRepository from "../repositories/StatusServiceRepository.js";

class StatusServiceService {
  static async getAll() {
    return StatusServiceRepository.getAll();
  }

  static async create(data: any) {
    return StatusServiceRepository.create(data);
  }

  static async remove(id: any) {
    return StatusServiceRepository.remove(id);
  }
}

export default StatusServiceService;
