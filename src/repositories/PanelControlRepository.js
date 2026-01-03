import panelControlModel from "../models/PanelControl.js";

class PanelControlRepository {
  static async getCountProductByService() {
    return panelControlModel.getCountProductByService();
  }

  static async getCountStatusByService() {
    return panelControlModel.getCountStatusByService();
  }

  static async getCountStatusPaymentByService() {
    return panelControlModel.getCountStatusPaymentByService();
  }

  static async getInfoPerformaceYearly() {
    return panelControlModel.getInfoPerformaceYearly();
  }
}

export default PanelControlRepository;
