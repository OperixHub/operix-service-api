// @ts-nocheck
import tenantsModel from "../models/Tenants.js";

class TenantsRepository {
  static async getAll() {
    return tenantsModel.getAll();
  }

  static async create(tenant: any) {
    return tenantsModel.create(tenant);
  }

  static async remove(id: any) {
    return tenantsModel.remove(id);
  }
}

export default TenantsRepository;
