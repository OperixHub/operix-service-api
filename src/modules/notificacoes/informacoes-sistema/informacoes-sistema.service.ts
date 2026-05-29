// @ts-nocheck
import InformacoesSistemaRepository from './informacoes-sistema.repository.js';

class InformacoesSistemaService {
  static async obterInformacoesSistema(tenant_id) { return InformacoesSistemaRepository.obterInformacoesSistema(tenant_id); }
}

export default InformacoesSistemaService;
