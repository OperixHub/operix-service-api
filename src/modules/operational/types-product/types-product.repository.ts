// @ts-nocheck
import connection from '../../../core/database/connection.js';

class TypesProductRepository {
  static async getAll(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM types_product WHERE tenant_id = $1', [tenant_id]);
    connect.release();
    return result.rows;
  }

  static async create(types_product) {
    const { tenant_id, name } = types_product;
    const connect = await connection.connect();
    const created = await connect.query('INSERT INTO types_product (tenant_id, name) VALUES ($1, $2)', [tenant_id, name]);
    connect.release();
    return created.rowCount;
  }

  static async remove(id, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query('DELETE FROM types_product WHERE id = $1 AND tenant_id = $2', [id, tenant_id]);
    connect.release();
    return removed.rowCount;
  }
}

export default TypesProductRepository;
