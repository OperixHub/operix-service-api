// @ts-nocheck
import ToolsRepository from "../repositories/ToolsRepository.js";

class ToolsService {
  static async getNotifications() {
    return ToolsRepository.getNotifications();
  }
}

export default ToolsService;
