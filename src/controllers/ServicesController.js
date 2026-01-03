import ServicesService from "../services/ServicesService.js";

class ServicesController {
  static async getAll(_req, res) {
    const services = await ServicesService.getAll();
    return res.status(200).json(services);
  }

  static async getAllWharehouse(_req, res) {
    const services = await ServicesService.getAllWharehouse();
    return res.status(200).json(services);
  }

  static async create(req, res) {
    const created = await ServicesService.create(req.body);
    return res.status(201).json(created);
  }

  static async updateWarehouse(req, res) {
    const { id, value } = req.params;
    const { typeTable } = req.body;
    await ServicesService.updateWarehouse(id, value, typeTable);
    return res.status(204).json();
  }

  static async updateInfoClient(req, res) {
    const { id } = req.params;
    await ServicesService.updateInfoClient(id, req.body);
    return res.status(204).json();
  }

  static async updateStatusService(req, res) {
    const { id, status } = req.params;
    const { typeTable } = req.body;
    await ServicesService.updateStatusService(id, status, typeTable);
    return res.status(204).json();
  }

  static async updateStatusPayment(req, res) {
    const { id, status } = req.params;
    const { typeTable } = req.body;
    await ServicesService.updateStatusPayment(id, status, typeTable);
    return res.status(204).json();
  }

  static async remove(req, res) {
    const { id, cod, typeTable } = req.params;
    await ServicesService.remove(id, cod, typeTable);
    return res.status(204).json();
  }
}

export const getAll = (req, res) => ServicesController.getAll(req, res);
export const getAllWharehouse = (req, res) => ServicesController.getAllWharehouse(req, res);
export const create = (req, res) => ServicesController.create(req, res);
export const updateWarehouse = (req, res) => ServicesController.updateWarehouse(req, res);
export const updateInfoClient = (req, res) => ServicesController.updateInfoClient(req, res);
export const updateStatusService = (req, res) => ServicesController.updateStatusService(req, res);
export const updateStatusPayment = (req, res) => ServicesController.updateStatusPayment(req, res);
export const remove = (req, res) => ServicesController.remove(req, res);

export default ServicesController;
