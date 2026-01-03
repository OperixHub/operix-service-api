import TypesProductRepository from "../repositories/TypesProductRepository.js";

class TypesProductService {
  static async getAll() {
    return TypesProductRepository.getAll();
  }

  static async create(data) {
    return TypesProductRepository.create(data);
  }

  static async remove(id) {
    return TypesProductRepository.remove(id);
  }
}

export default TypesProductService;
