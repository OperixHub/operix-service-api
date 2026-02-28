import type { Request, Response } from 'express';
import StatusPaymentService from "../services/StatusPaymentService.js";

export default class StatusPaymentController {
  static async getAll(_req: Request, res: Response) {
    const status_payment = await StatusPaymentService.getAll();
    return res.status(200).json(status_payment);
  }

  static async create(req: Request, res: Response) {
    const status_payment = await StatusPaymentService.create(req.body);
    return res.status(201).json(status_payment);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    await StatusPaymentService.remove(id);
    return res.status(204).json();
  }
}
