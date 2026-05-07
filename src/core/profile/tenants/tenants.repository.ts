import connection from '../../database/connection.js';
import TenantModel from './tenants.model.js';

class TenantsRepository {
  static tableName = 'tenants';

  static async getAll() {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName}`);
    connect.release();
    return result.rows;
  }

  static async count() {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT COUNT(*)::int AS total FROM ${this.tableName}`);
    connect.release();
    return result.rows[0]?.total || 0;
  }

  static async create(tenant: TenantModel) {
    const connect = await connection.connect();
    const result = await connect.query(
      `INSERT INTO ${this.tableName}
       (keycloak_group_id,name,cnpj,description,logo_url,plan_key,subscription_status,trial_started_at,trial_ends_at,enabled_modules)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'trial'), COALESCE($7, 'trialing'), COALESCE($8, NOW()), COALESCE($9, NOW() + INTERVAL '30 days'), COALESCE($10, '[]'::jsonb))
       RETURNING *`,
      [
        tenant.keycloak_group_id,
        tenant.name,
        tenant.cnpj || null,
        tenant.description || null,
        tenant.logo_url || null,
        tenant.plan_key || null,
        tenant.subscription_status || null,
        tenant.trial_started_at || null,
        tenant.trial_ends_at || null,
        JSON.stringify(tenant.enabled_modules || []),
      ],
    );
    connect.release();
    return result.rows[0];
  }

  static async update(id: number, tenant: Partial<TenantModel>) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE ${this.tableName}
       SET name = COALESCE($2, name),
           cnpj = $3,
           description = $4,
           logo_url = $5,
           enabled_modules = COALESCE($6, enabled_modules),
           updatedAt = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        tenant.name || null,
        tenant.cnpj ?? null,
        tenant.description ?? null,
        tenant.logo_url ?? null,
        tenant.enabled_modules ? JSON.stringify(tenant.enabled_modules) : null,
      ],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async remove(id: number) {
    const connect = await connection.connect();
    const result = await connect.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    connect.release();
    return result.rowCount;
  }

  static async findByKeycloakGroupId(keycloakGroupId: string) {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName} WHERE keycloak_group_id = $1`, [keycloakGroupId]);
    connect.release();
    return result.rows[0] || null;
  }

  static async findByName(name: string) {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName} WHERE LOWER(name) = LOWER($1)`, [name]);
    connect.release();
    return result.rows[0] || null;
  }

  static async findById(id: number) {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    connect.release();
    return result.rows[0] || null;
  }
}

export default TenantsRepository;
