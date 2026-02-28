import type { Request, Response } from 'express';
import ToolsService from "../services/ToolsService.js";

export default class ToolsController {
  static async getNotifications(_req: Request, res: Response) {
    const notification = await ToolsService.getNotifications();
    return res.status(200).json(notification);
  }
}
