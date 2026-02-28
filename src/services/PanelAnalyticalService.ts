// @ts-nocheck
import PanelAnalyticalRepository from "../repositories/PanelAnalyticalRepository.js";

class PanelAnalyticalService {
  static async getOrdersPaid() {
    return PanelAnalyticalRepository.getOrdersPaid();
  }

  static async loadExpensesAll() {
    return PanelAnalyticalRepository.loadExpensesAll();
  }
}

export default PanelAnalyticalService;
