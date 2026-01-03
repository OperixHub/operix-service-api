import statusPaymentModel from "../models/StatusPayment.js";

class StatusPaymentRepository {
  static async getAll() {
    return statusPaymentModel.getAll();
  }

  static async create(data) {
    return statusPaymentModel.create(data);
  }

  static async remove(id) {
    return statusPaymentModel.remove(id);
  }
}

export default StatusPaymentRepository;
