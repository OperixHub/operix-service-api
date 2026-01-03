import ExpensesService from "../services/ExpensesService.js";
import utilities from "../utils/utils.js";

class ExpensesController {
  static async getAll(_req, res) {
    const expenses = await ExpensesService.getAll();
    return res.status(200).json(expenses);
  }

  static async create(req, res) {
    const dateFormated = utilities.formatDate(req.body.date);
    req.body.date = dateFormated;
    const expenses = await ExpensesService.create(req.body);
    return res.status(201).json(expenses);
  }

  static async remove(req, res) {
    const { id } = req.params;
    await ExpensesService.remove(id);
    return res.status(204).json();
  }
}

export const getAll = (req, res) => ExpensesController.getAll(req, res);
export const create = (req, res) => ExpensesController.create(req, res);
export const remove = (req, res) => ExpensesController.remove(req, res);

export default ExpensesController;