import ExpensesRepository from "../repositories/ExpensesRepository.js";

class ExpensesService {
  static async getAll() {
    return ExpensesRepository.getAll();
  }

  static async create(data) {
    return ExpensesRepository.create(data);
  }

  static async remove(id) {
    return ExpensesRepository.remove(id);
  }
}

export default ExpensesService;
