// @ts-nocheck
import connection from '../../../core/database/connection.js';
import UserModel from './users.model.js';

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

  static async create(user: UserModel) {
    const connect = await connection.connect();
    const result = await connect.query('INSERT INTO users (keycloak_id, tenant_id, name, username, email, password, root, admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [user.keycloak_id, user.tenant_id, user.name, user.username, user.email, user.password, user.root, user.admin]);
    connect.release();
    return result.rows[0];
  }
}

export default UsersRepository;
