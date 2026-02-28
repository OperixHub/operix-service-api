// @ts-nocheck
import TenantsRepository from "../repositories/TenantsRepository";

class TenantsService {
  static async getAll() {
    return TenantsRepository.getAll();
  }

  static async create(tenantData: { name: string }) {
    return TenantsRepository.create(tenantData.name);
  }

  static async remove(id: string | number) {
    const isRemoved = await TenantsRepository.remove(id);
    if (!isRemoved) {
      throw Object.assign(new Error("Erro ao deletar Unidade!"), { status: 400 });
    }
    return isRemoved;
  }
}

export default TenantsService;
