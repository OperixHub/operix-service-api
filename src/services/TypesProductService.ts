// @ts-nocheck
import TypesProductRepository from "../repositories/TypesProductRepository.js";

class TypesProductService {
  static async getAll() {
    return TypesProductRepository.getAll();
  }

  static async create(data: any) {
    return TypesProductRepository.create(data);
  }

  static async remove(id: any) {
    return TypesProductRepository.remove(id);
  }
}

export default TypesProductService;
