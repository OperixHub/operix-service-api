// @ts-nocheck
import expensesModel from "../models/Expenses.js";

class ExpensesRepository {
  static async getAll() {
    return expensesModel.getAll();
  }

  static async create(data: any) {
    return expensesModel.create(data);
  }

  static async remove(id: any) {
    return expensesModel.remove(id);
  }
}

export default ExpensesRepository;
