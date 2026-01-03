import panelAnalyticalModel from "../models/PanelAnalytical.js";

class PanelAnalyticalRepository {
  // Retorna pedidos pagos (mapeia para getOrdersPaid do model existente)
  static async getSumValuesOrdersPaid() {
    return panelAnalyticalModel.getOrdersPaid();
  }

  // Retorna valores de despesas/invoice (mapeia para loadExpensesAll do model existente)
  static async getValuesInvoicingLiquid() {
    return panelAnalyticalModel.loadExpensesAll();
  }
}

export default PanelAnalyticalRepository;
