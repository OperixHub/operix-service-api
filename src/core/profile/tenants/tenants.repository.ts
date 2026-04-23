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

  static async create(tenant: TenantModel) {
    const connect = await connection.connect();
    const result = await connect.query(`INSERT INTO ${this.tableName} (keycloak_group_id,name) VALUES ($1, $2) RETURNING *`, [tenant.keycloak_group_id, tenant.name]);
    connect.release();
    return result.rows[0];
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
