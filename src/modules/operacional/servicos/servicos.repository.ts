// @ts-nocheck
import connection from '../../../core/database/connection.js';
import MensageriaService from '../../../core/utils/mensageria.service.js';
import OrdemServicoRepository from '../ordem-servico/ordem-servico.repository.js';
import StatusPagamentoRepository from '../status-pagamento/status-pagamento.repository.js';
import Utilitarios from '../../../core/utils/utilitarios.js';

class ServicosRepository {
  static async recarregarDadosSocket(tenant_id, typeTable) {
    let data = null;
    if (typeTable == 1) data = await this.obterTodos(tenant_id);
    else if (typeTable == 2) data = await this.obterTodosAlmoxarifado(tenant_id);
    MensageriaService.notificarLocatario(tenant_id, 'reloadDataService', data);
    return true;
  }

  static async obterTodosPaid(tenant_id) {
    const status = await StatusPagamentoRepository.obterStatusUnico('Pago', tenant_id);
    const connect = await connection.connect();
    const services = await connect.query('SELECT * FROM services WHERE payment_status = $1 AND tenant_id = $2', [status[0].cod, tenant_id]);
    connect.release();
    return services.rows;
  }

  static async obterTodosNaoConcluidos(tenant_id) {
    const connect = await connection.connect();
    const services = await connect.query('SELECT * FROM services WHERE warehouse_status = false AND status <> 13 AND tenant_id = $1 ORDER BY id DESC', [tenant_id]);
    connect.release();
    return services.rows;
  }

  static async obterTodos(tenant_id) {
    const connect = await connection.connect();
    const services = await connect.query('SELECT * FROM services WHERE warehouse_status = false AND tenant_id = $1 ORDER BY id DESC', [tenant_id]);
    connect.release();
    return services.rows;
  }

  static async obterTodosAlmoxarifado(tenant_id) {
    const connect = await connection.connect();
    const services = await connect.query('SELECT * FROM services WHERE warehouse_status = true AND tenant_id = $1 ORDER BY created_at_warehouse DESC', [tenant_id]);
    connect.release();
    return services.rows;
  }

  static async criar(service) {
    const { tenant_id, product, client, telephone, adress, status, observation, created_at, typeTable } = service;
    const cod_order = await OrdemServicoRepository.criar(created_at, tenant_id);
    if (!cod_order) return false;

    const connect = await connection.connect();
    const created = await connect.query(
      'INSERT INTO services(tenant_id, product, client, telephone, adress, status, payment_status, order_of_service, observation, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [tenant_id, product, client, telephone, adress, status, 1, cod_order, observation, created_at]
    );
    connect.release();
    await this.recarregarDadosSocket(tenant_id, typeTable);
    return created.rowCount;
  }

  static async atualizarAlmoxarifado(id, tenant_id, value, typeTable) {
    const created_at_warehouse = Utilitarios.gerarDataLocal();
    const warehouse_status = value === 'false' ? true : false;
    const connect = await connection.connect();
    const updated = await connect.query('UPDATE services SET warehouse_status = $1, created_at_warehouse = $2 WHERE id = $3 AND tenant_id = $4', [warehouse_status, created_at_warehouse, id, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(tenant_id, typeTable);
    return updated.rowCount;
  }

  static async atualizarInfoCliente(id, tenant_id, info) {
    const { product, client, telephone, adress, observation, typeTable } = info;
    const connect = await connection.connect();
    const updated = await connect.query('UPDATE services SET product = $1, client = $2, telephone = $3, adress = $4, observation = $5 WHERE id = $6 AND tenant_id = $7', [product, client, telephone, adress, observation, id, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(tenant_id, typeTable);
    return updated.rowCount;
  }

  static async atualizarStatusServico(id, tenant_id, status, typeTable) {
    const updated_at_service = Utilitarios.gerarDataLocal();
    const connect = await connection.connect();
    const updated = await connect.query('UPDATE services SET status = $1, updated_at_service = $2 WHERE id = $3 AND tenant_id = $4 RETURNING id, status', [status, updated_at_service, id, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(tenant_id, typeTable);
    return updated.rowCount;
  }

  static async atualizarStatusPagamento(id, tenant_id, status, typeTable) {
    const updated_at_payment = Utilitarios.gerarDataLocal();
    const connect = await connection.connect();
    const updated = await connect.query('UPDATE services SET payment_status = $1, updated_at_payment = $2 WHERE id = $3 AND tenant_id = $4', [status, updated_at_payment, id, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(tenant_id, typeTable);
    return updated.rowCount;
  }

  static async remover(id, tenant_id, cod_order, typeTable) {
    const connect = await connection.connect();
    const removed = await connect.query('DELETE FROM services WHERE id = $1 AND tenant_id = $2', [id, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(tenant_id, typeTable);
    if (removed.rowCount) await OrdemServicoRepository.remover(cod_order, tenant_id);
    return removed.rowCount;
  }
}

export default ServicosRepository;
