import type { Request, Response } from 'express';
import StatusServiceService from "../services/StatusServiceService.js";

export default class StatusServiceController {
  static async getAll(_req: Request, res: Response) {
    const status_service = await StatusServiceService.getAll();
    return res.status(200).json(status_service);
  }

  static async create(req: Request, res: Response) {
    const status_service = await StatusServiceService.create(req.body);
    return res.status(201).json(status_service);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    await StatusServiceService.remove(id);
    return res.status(204).json();
  }
}
