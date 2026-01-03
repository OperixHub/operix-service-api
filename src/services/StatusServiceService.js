import StatusServiceRepository from "../repositories/StatusServiceRepository.js";

class StatusServiceService {
  static async getAll() {
    return StatusServiceRepository.getAll();
  }

  static async create(data) {
    return StatusServiceRepository.create(data);
  }

  static async remove(id) {
    return StatusServiceRepository.remove(id);
  }
}

export default StatusServiceService;
