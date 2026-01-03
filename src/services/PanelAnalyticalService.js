import PanelAnalyticalRepository from "../repositories/PanelAnalyticalRepository.js";

class PanelAnalyticalService {
  static async getSumValuesOrdersPaid() {
    return PanelAnalyticalRepository.getSumValuesOrdersPaid();
  }

  static async getValuesInvoicingLiquid() {
    return PanelAnalyticalRepository.getValuesInvoicingLiquid();
  }
}

export default PanelAnalyticalService;
