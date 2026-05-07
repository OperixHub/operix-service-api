import connection from '../../database/connection.js';
import UserModel from './users.model.js';

class UsersRepository {
  static async getAll(tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query(
      'SELECT id, name, username, email, tenant_id, admin, root, avatar_url, role_title, active, preferences FROM users WHERE tenant_id = $1 ORDER BY id',
      [tenantId],
    );
    connect.release();
    return result.rows;
  }

  static async getById(user: UserModel, tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [user.id, tenantId]);
    connect.release();
    return result.rows;
  }

  static async findByIdAndTenantId(id: number, tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    connect.release();
    return result.rows[0] || null;
  }

  static async remove(user: UserModel, tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query('DELETE FROM users WHERE id = $1 AND tenant_id = $2', [user.id, tenantId]);
    connect.release();
    return result.rowCount;
  }

  static async create(user: UserModel) {
    const connect = await connection.connect();
    const result = await connect.query(
      `INSERT INTO users
       (keycloak_id, tenant_id, name, username, email, password, root, admin, avatar_url, role_title, active, preferences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, true), COALESCE($12, '{}'::jsonb))
       RETURNING *`,
      [
        user.keycloak_id,
        user.tenant_id,
        user.name,
        user.username,
        user.email,
        user.password,
        user.root,
        user.admin,
        user.avatar_url || null,
        user.role_title || null,
        user.active,
        JSON.stringify(user.preferences || {}),
      ],
    );
    connect.release();
    return result.rows[0];
  }

  static async updateProfile(id: number, tenantId: number, data: Partial<UserModel>) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET name = COALESCE($3, name),
           avatar_url = $4,
           role_title = COALESCE($5, role_title),
           preferences = COALESCE($6, preferences),
           updatedAt = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, name, username, email, tenant_id, admin, root, avatar_url, role_title, active, preferences`,
      [
        id,
        tenantId,
        data.name || null,
        data.avatar_url ?? null,
        data.role_title || null,
        data.preferences ? JSON.stringify(data.preferences) : null,
      ],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async updateUserAccess(id: number, tenantId: number, data: Partial<UserModel>) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET admin = COALESCE($3, admin),
           root = COALESCE($4, root),
           active = COALESCE($5, active),
           role_title = COALESCE($6, role_title),
           updatedAt = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, name, username, email, tenant_id, admin, root, avatar_url, role_title, active, preferences`,
      [id, tenantId, data.admin ?? null, data.root ?? null, data.active ?? null, data.role_title || null],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async findByKeycloakId(keycloakId: string) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE keycloak_id = $1', [keycloakId]);
    connect.release();
    return result.rows[0] || null;
  }

  static async findByEmail(email: string) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE email = $1', [email]);
    connect.release();
    return result.rows[0] || null;
  }
}

export default UsersRepository;
