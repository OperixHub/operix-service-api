import type { Request, Response } from 'express';
import TypesProductService from "../services/TypesProductService.js";

export default class TypesProductController {
  static async getAll(_req: Request, res: Response) {
    const types_product = await TypesProductService.getAll();
    return res.status(200).json(types_product);
  }

  static async create(req: Request, res: Response) {
    const types_product = await TypesProductService.create(req.body);
    return res.status(201).json(types_product);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    await TypesProductService.remove(id);
    return res.status(204).json();
  }
}
