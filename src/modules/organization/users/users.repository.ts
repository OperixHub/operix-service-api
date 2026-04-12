// @ts-nocheck
import connection from '../../../core/database/connection.js';

class UsersRepository {
  static async getAll(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT id, username, email, tenant_id, admin, root FROM users WHERE tenant_id = $1 ORDER BY id', [tenant_id]);
    connect.release();
    return result.rows;
  }

  static async getById(user, tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [user.id, tenant_id]);
    connect.release();
    return result.rows;
  }

  static async remove(user, tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('DELETE FROM users WHERE id = $1 AND tenant_id = $2', [user.id, tenant_id]);
    connect.release();
    return result.rowCount;
  }
}

export default UsersRepository;
