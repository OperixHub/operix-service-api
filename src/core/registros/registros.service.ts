import RegistrosRepository from './registros.repository.js';

class RegistrosService {
  static async inserirRegistro(data: any) {
    // Fire and forget: não bloqueia o endpoint
    RegistrosRepository.inserirRegistro(data);
  }

  static async obterRegistrosPaginados(tenant_id: any, page: number, limit: number) {
    const result = await RegistrosRepository.obterRegistrosPaginados(tenant_id, page, limit);
    return { data: result.data || [], total: result.total || 0, page, limit };
  }
}

export default RegistrosService;
