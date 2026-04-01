import LogsRepository from "../repositories/LogsRepository.js";

class LogsService {
  static async insertLog(data: any) {
    // Fire and forget strategy (assíncrono) para não bloquear o endpoint
    LogsRepository.insertLog(data);
  }

  static async getPaginatedLogs(tenant_id: any, page: number, limit: number) {
    const result = await LogsRepository.getPaginatedLogs(tenant_id, page, limit);

    return {
      data: result.data || [],
      total: result.total || 0,
      page,
      limit,
    };
  }
}

export default LogsService;
