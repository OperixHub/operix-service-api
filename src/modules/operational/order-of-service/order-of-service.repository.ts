// @ts-nocheck
import connection from '../../../core/database/connection.js';
import MessagingService from '../../../core/utils/messaging.service.js';

class OrderOfServiceRepository {
  static async reloadSocketData(cod_order, tenant_id) {
    const data = await this.getUnique(cod_order, tenant_id);
    MessagingService.notifyTenant(tenant_id, 'reloadDataOrders', data);
    return true;
  }

  static async getUnique(cod, tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM order_of_service WHERE cod_order = $1 AND tenant_id = $2', [cod, tenant_id]);
    connect.release();
    return result.rows;
  }

  static async getAll(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM order_of_service WHERE tenant_id = $1', [tenant_id]);
    connect.release();
    return result.rows;
  }

  static async create(created_at, tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('INSERT INTO order_of_service(created_at, tenant_id) VALUES ($1, $2) RETURNING cod_order', [created_at, tenant_id]);
    connect.release();
    return result.rows[0].cod_order;
  }

  static async removeEstimate(cod, tenant_id, idEstimate) {
    const getOrderValue = await this.getUnique(cod, tenant_id);
    if (getOrderValue.length === 0) return 0;
    let estimateArray = JSON.parse(getOrderValue[0].estimate);
    estimateArray = estimateArray.filter((e) => e.id != idEstimate);
    let newValue = 0;
    for (const record of estimateArray) newValue += record.price;
    estimateArray = JSON.stringify(estimateArray);
    const connect = await connection.connect();
    const removed = await connect.query('UPDATE order_of_service SET estimate = $1, value = $2 WHERE cod_order = $3 AND tenant_id = $4', [estimateArray, newValue, cod, tenant_id]);
    connect.release();
    await this.reloadSocketData(cod, tenant_id);
    return removed.rowCount;
  }

  static async removeEstimateSimple(cod, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query('UPDATE order_of_service SET estimate = $1, value = $2 WHERE cod_order = $3 AND tenant_id = $4', [null, null, cod, tenant_id]);
    connect.release();
    await this.reloadSocketData(cod, tenant_id);
    return removed.rowCount;
  }

  static async updateEstimate(estimateArray, totalPrice, cod, tenant_id) {
    const connect = await connection.connect();
    const updated = await connect.query('UPDATE order_of_service SET estimate = $1, value = $2 WHERE cod_order = $3 AND tenant_id = $4', [estimateArray, totalPrice, cod, tenant_id]);
    connect.release();
    await this.reloadSocketData(cod, tenant_id);
    return updated.rowCount;
  }

  static async remove(cod_order, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query('DELETE FROM order_of_service WHERE cod_order = $1 AND tenant_id = $2', [cod_order, tenant_id]);
    connect.release();
    return removed.rowCount;
  }
}

export default OrderOfServiceRepository;
