import type { Request, Response } from 'express';
import ExpensesService from "../services/ExpensesService.js";
import utilities from "../utils/utils.js";

export default class ExpensesController {
  static async getAll(_req: Request, res: Response) {
    const expenses = await ExpensesService.getAll();
    return res.status(200).json(expenses);
  }

  static async create(req: Request, res: Response) {
    const dateFormated = utilities.formatDate(req.body.date);
    req.body.date = dateFormated;
    const expenses = await ExpensesService.create(req.body);
    return res.status(201).json(expenses);
  }

  static async remove(req: Request, res: Response) {
    const { id } = req.params;
    await ExpensesService.remove(id);
    return res.status(204).json();
  }
}