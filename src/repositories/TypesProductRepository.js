import typesProductModel from "../models/TypesProduct.js";

class TypesProductRepository {
  static async getAll() {
    return typesProductModel.getAll();
  }

  static async create(data) {
    return typesProductModel.create(data);
  }

  static async remove(id) {
    return typesProductModel.remove(id);
  }
}

export default TypesProductRepository;
