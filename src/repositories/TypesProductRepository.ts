// @ts-nocheck
import typesProductModel from "../models/TypesProduct.js";

class TypesProductRepository {
  static async getAll() {
    return typesProductModel.getAll();
  }

  static async create(data: any) {
    return typesProductModel.create(data);
  }

  static async remove(id: any) {
    return typesProductModel.remove(id);
  }
}

export default TypesProductRepository;
