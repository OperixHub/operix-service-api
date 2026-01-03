import toolsModel from "../models/Tools.js";

class ToolsRepository {
  static async getNotifications() {
    return toolsModel.getNotifications();
  }
}

export default ToolsRepository;
