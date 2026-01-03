import PanelControlRepository from "../repositories/PanelControlRepository.js";

class PanelControlService {
  static async getCountProductByService() {
    return PanelControlRepository.getCountProductByService();
  }

  static async getCountStatusByService() {
    return PanelControlRepository.getCountStatusByService();
  }

  static async getCountStatusPaymentByService() {
    return PanelControlRepository.getCountStatusPaymentByService();
  }

  static async getInfoPerformaceYearly() {
    return PanelControlRepository.getInfoPerformaceYearly();
  }
}

export default PanelControlService;
