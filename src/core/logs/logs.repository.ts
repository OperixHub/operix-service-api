import connection from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';

class LogsRepository {
  static async insertLog(data: any) {
    const connect = await connection.connect();
    const id = uuidv4();
    const query = `
      INSERT INTO system_logs (id, tenant_id, user_id, method, url, status, response_time_ms, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [id, data.tenant_id || null, data.user_id || null, data.method, data.url, data.status, data.response_time_ms || null, data.message || null];
    try {
      await connect.query(query, values);
    } catch (e) {
      console.error('[LogsRepository] Erro ao persistir log', e);
    } finally {
      connect.release();
    }
  }

  static async getPaginatedLogs(tenant_id: any, page = 1, limit = 50) {
    const connect = await connection.connect();
    const offset = (page - 1) * limit;
    try {
      let queryLogs: string, queryCount: string, values: any[], countValues: any[];
      if (tenant_id) {
        queryLogs = `SELECT * FROM system_logs WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        values = [tenant_id, limit, offset];
        queryCount = `SELECT count(*) FROM system_logs WHERE tenant_id = $1`;
        countValues = [tenant_id];
      } else {
        queryLogs = `SELECT * FROM system_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        values = [limit, offset];
        queryCount = `SELECT count(*) FROM system_logs`;
        countValues = [];
      }
      const logsResult = await connect.query(queryLogs, values);
      const countResult = await connect.query(queryCount, countValues);
      return { data: logsResult.rows, total: parseInt(countResult.rows[0].count, 10) };
    } finally {
      connect.release();
    }
  }
}

export default LogsRepository;
