// @ts-nocheck
import connection from '../../../core/database/connection.js';

class StatusPaymentRepository {
  static async getAll(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM status_payment WHERE tenant_id = $1', [tenant_id]);
    connect.release();
    return result.rows;
  }

  static async getUniqueStatus(description, tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT cod FROM status_payment WHERE description = $1 AND tenant_id = $2', [description, tenant_id]);
    connect.release();
    return result.rows;
  }

  static async create(status_payment) {
    const { tenant_id, description, cod, color } = status_payment;
    const connect = await connection.connect();
    const created = await connect.query('INSERT INTO status_payment (tenant_id, description, cod, color) VALUES ($1, $2, $3, $4)', [tenant_id, description, cod, color]);
    connect.release();
    return created.rowCount;
  }

  static async remove(id, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query('DELETE FROM status_payment WHERE id = $1 AND tenant_id = $2', [id, tenant_id]);
    connect.release();
    return removed.rowCount;
  }
}

export default StatusPaymentRepository;
