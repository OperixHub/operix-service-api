// @ts-nocheck
import TypesProductRepository from './types-product.repository.js';

class TypesProductService {
  static async getAll(tenant_id) { return TypesProductRepository.getAll(tenant_id); }
  static async create(typeProduct) { return TypesProductRepository.create(typeProduct); }
  static async remove(id, tenant_id) { return TypesProductRepository.remove(id, tenant_id); }
}

export default TypesProductService;
