// @ts-nocheck
import EstoqueRepository from './estoque.repository.js';

class EstoqueService {
  static async obterTodos(tenant_id) { return EstoqueRepository.obterTodos(tenant_id); }
  static async criar(stock) { return EstoqueRepository.criar(stock); }
  static async atualizar(id, tenant_id, data) { return EstoqueRepository.atualizar(id, tenant_id, data); }
  static async remover(id, tenant_id) { return EstoqueRepository.remover(id, tenant_id); }
}

export default EstoqueService;
