// @ts-nocheck
import ServicosRepository from './servicos.repository.js';
import Utilitarios from '../../../core/utils/utilitarios.js';

class ServicosService {
  static async obterTodos(tenant_id) { return ServicosRepository.obterTodos(tenant_id); }
  static async obterTodosAlmoxarifado(tenant_id) { return ServicosRepository.obterTodosAlmoxarifado(tenant_id); }
  static async obterNaoConcluidos(tenant_id) { return ServicosRepository.obterTodosNaoConcluidos(tenant_id); }

  static async criar(service) {
    const created_at = Utilitarios.gerarDataLocal();
    service.created_at = created_at;
    return ServicosRepository.criar(service);
  }

  static async atualizarAlmoxarifado(id, tenant_id, value, typeTable) { return ServicosRepository.atualizarAlmoxarifado(id, tenant_id, value, typeTable); }
  static async atualizarInfoCliente(id, tenant_id, info) { return ServicosRepository.atualizarInfoCliente(id, tenant_id, info); }
  static async atualizarStatusServico(id, tenant_id, status, typeTable) { return ServicosRepository.atualizarStatusServico(id, tenant_id, status, typeTable); }
  static async atualizarStatusPagamento(id, tenant_id, status, typeTable) { return ServicosRepository.atualizarStatusPagamento(id, tenant_id, status, typeTable); }
  static async remover(id, tenant_id, cod, typeTable) { return ServicosRepository.remover(id, tenant_id, cod, typeTable); }
}

export default ServicosService;

// API pública do módulo usada por notifications
export { ServicosService as ConsultaServicosService };
