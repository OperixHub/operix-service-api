import type { Request, Response } from 'express';
import TenantsService from '../services/TenantsService';

export default class TenantsController {
  static async getAll(_req: Request, res: Response) {
    try {
      const tenants = await TenantsService.getAll();
      return res.status(200).json(tenants);
    } catch (error: any) {
      return res.status(error.status || 500).json({ msg: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const created = await TenantsService.create(req.body);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(error.status || 500).json({ msg: error.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      await TenantsService.remove(req.params.id as string);
      return res.status(204).json();
    } catch (error: any) {
      return res.status(error.status || 500).json({ msg: error.message });
    }
  }
}
