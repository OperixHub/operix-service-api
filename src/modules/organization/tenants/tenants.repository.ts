// @ts-nocheck
import connection from '../../../core/database/connection.js';

class TenantsRepository {
  static tableName = 'tenants';

  static async getAll() {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName}`);
    connect.release();
    return result.rows;
  }

  static async create(tenantname) {
    const connect = await connection.connect();
    const result = await connect.query(`INSERT INTO ${this.tableName} (name) VALUES ($1)`, [tenantname]);
    connect.release();
    return result.rowCount;
  }

  static async remove(id) {
    const connect = await connection.connect();
    const result = await connect.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    connect.release();
    return result.rowCount;
  }
}

export default TenantsRepository;
