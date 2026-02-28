// @ts-nocheck
import ExpensesRepository from "../repositories/ExpensesRepository.js";

class ExpensesService {
  static async getAll() {
    return ExpensesRepository.getAll();
  }

  static async create(data: any) {
    return ExpensesRepository.create(data);
  }

  static async remove(id: any) {
    return ExpensesRepository.remove(id);
  }
}

export default ExpensesService;
