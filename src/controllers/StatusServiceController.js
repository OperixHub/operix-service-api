import StatusServiceService from "../services/StatusServiceService.js";

class StatusServiceController {
  static async getAll(_req, res) {
    const status_service = await StatusServiceService.getAll();
    return res.status(200).json(status_service);
  }

  static async create(req, res) {
    const status_service = await StatusServiceService.create(req.body);
    return res.status(201).json(status_service);
  }

  static async remove(req, res) {
    const { id } = req.params;
    await StatusServiceService.remove(id);
    return res.status(204).json();
  }
}

export const getAll = (req, res) => StatusServiceController.getAll(req, res);
export const create = (req, res) => StatusServiceController.create(req, res);
export const remove = (req, res) => StatusServiceController.remove(req, res);

export default StatusServiceController;