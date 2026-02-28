import type { Request, Response } from 'express';
import ServicesService from "../services/ServicesService.js";

export default class ServicesController {
  static async getAll(_req: Request, res: Response) {
    const services = await ServicesService.getAll();
    return res.status(200).json(services);
  }

  static async getAllWharehouse(_req: Request, res: Response) {
    const services = await ServicesService.getAllWharehouse();
    return res.status(200).json(services);
  }

  static async create(req: Request, res: Response) {
    const created = await ServicesService.create(req.body);
    return res.status(201).json(created);
  }

  static async updateWarehouse(req: Request, res: Response) {
    const { id, value } = req.params;
    const { typeTable } = req.body;
    await ServicesService.updateWarehouse(id, value, typeTable);
    return res.status(204).json();
  }

  static async updateInfoClient(req: Request, res: Response) {
    const { id } = req.params;
    await ServicesService.updateInfoClient(id, req.body);
    return res.status(204).json();
  }

  static async updateStatusService(req: Request, res: Response) {
    const { id, status } = req.params;
    const { typeTable } = req.body;
    await ServicesService.updateStatusService(id, status, typeTable);
    return res.status(204).json();
  }

  static async updateStatusPayment(req: Request, res: Response) {
    const { id, status } = req.params;
    const { typeTable } = req.body;
    await ServicesService.updateStatusPayment(id, status, typeTable);
    return res.status(204).json();
  }

  static async remove(req: Request, res: Response) {
    const { id, cod, typeTable } = req.params;
    await ServicesService.remove(id, cod, typeTable);
    return res.status(204).json();
  }
}
