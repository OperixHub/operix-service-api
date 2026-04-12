// @ts-nocheck
import connection from '../../../core/database/connection.js';

class StatusServiceRepository {
  static async getAll(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM status_service WHERE tenant_id = $1', [tenant_id]);
    connect.release();
    return result.rows;
  }

  static async create(status_service) {
    const { tenant_id, description, cod, color } = status_service;
    const connect = await connection.connect();
    const created = await connect.query('INSERT INTO status_service (tenant_id, description, cod, color) VALUES ($1, $2, $3, $4)', [tenant_id, description, cod, color]);
    connect.release();
    return created.rowCount;
  }

  static async remove(id, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query('DELETE FROM status_service WHERE id = $1 AND tenant_id = $2', [id, tenant_id]);
    connect.release();
    return removed.rowCount;
  }
}

export default StatusServiceRepository;
