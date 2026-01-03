import TypesProductService from "../services/TypesProductService.js";

class TypesProductController {
  static async getAll(_req, res) {
    const types_product = await TypesProductService.getAll();
    return res.status(200).json(types_product);
  }

  static async create(req, res) {
    const types_product = await TypesProductService.create(req.body);
    return res.status(201).json(types_product);
  }

  static async remove(req, res) {
    const { id } = req.params;
    await TypesProductService.remove(id);
    return res.status(204).json();
  }
}

export const getAll = (req, res) => TypesProductController.getAll(req, res);
export const create = (req, res) => TypesProductController.create(req, res);
export const remove = (req, res) => TypesProductController.remove(req, res);

export default TypesProductController;