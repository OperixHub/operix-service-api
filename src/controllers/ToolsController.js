import ToolsService from "../services/ToolsService.js";

class ToolsController {
  static async getNotifications(_req, res) {
    const notification = await ToolsService.getNotifications();
    return res.status(200).json(notification);
  }
}

export const getNotifications = (req, res) => ToolsController.getNotifications(req, res);

export default ToolsController;
