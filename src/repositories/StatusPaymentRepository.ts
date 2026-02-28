// @ts-nocheck
import statusPaymentModel from "../models/StatusPayment.js";

class StatusPaymentRepository {
  static async getAll() {
    return statusPaymentModel.getAll();
  }

  static async create(data: any) {
    return statusPaymentModel.create(data);
  }

  static async remove(id: any) {
    return statusPaymentModel.remove(id);
  }
}

export default StatusPaymentRepository;
