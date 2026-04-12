// @ts-nocheck
import TenantsRepository from './tenants.repository.js';

class TenantsService {
  static async getAll() { return TenantsRepository.getAll(); }

  static async create(tenant) { return TenantsRepository.create(tenant.name); }

  static async remove(id) {
    const isRemoved = await TenantsRepository.remove(id);
    if (!isRemoved) throw Object.assign(new Error('Erro ao deletar Unidade!'), { status: 400 });
    return isRemoved;
  }
}

export default TenantsService;
