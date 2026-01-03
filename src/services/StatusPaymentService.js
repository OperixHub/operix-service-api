import StatusPaymentRepository from "../repositories/StatusPaymentRepository.js";

class StatusPaymentService {
  static async getAll() {
    return StatusPaymentRepository.getAll();
  }

  static async create(data) {
    return StatusPaymentRepository.create(data);
  }

  static async remove(id) {
    return StatusPaymentRepository.remove(id);
  }
}

export default StatusPaymentService;
