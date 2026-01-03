import StatusPaymentService from "../services/StatusPaymentService.js";

class StatusPaymentController {
  static async getAll(_req, res) {
    const status_payment = await StatusPaymentService.getAll();
    return res.status(200).json(status_payment);
  }

  static async create(req, res) {
    const status_payment = await StatusPaymentService.create(req.body);
    return res.status(201).json(status_payment);
  }

  static async remove(req, res) {
    const { id } = req.params;
    await StatusPaymentService.remove(id);
    return res.status(204).json();
  }
}

export const getAll = (req, res) => StatusPaymentController.getAll(req, res);
export const create = (req, res) => StatusPaymentController.create(req, res);
export const remove = (req, res) => StatusPaymentController.remove(req, res);

export default StatusPaymentController;