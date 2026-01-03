import TenantsRepository from "../repositories/TenantsRepository.js";

class TenantsService {
  static async getAll() {
    return TenantsRepository.getAll();
  }

  static async create(tenant) {
    return TenantsRepository.create(tenant);
  }

  static async remove(id) {
    return TenantsRepository.remove(id);
  }
}

export default TenantsService;
