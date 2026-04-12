// @ts-nocheck
import ToolsRepository from './tools.repository.js';

class ToolsService {
  static async getNotifications(tenant_id) { return ToolsRepository.getNotifications(tenant_id); }
}

export default ToolsService;
