import tenantsModel from "../models/Tenants.js";

class TenantsRepository {
  static async getAll() {
    return tenantsModel.getAll();
  }

  static async create(tenant) {
    return tenantsModel.create(tenant);
  }

  static async remove(id) {
    return tenantsModel.remove(id);
  }
}

export default TenantsRepository;
