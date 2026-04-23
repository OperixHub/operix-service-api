// @ts-nocheck
import SystemInfoRepository from './system-info.repository.js';

class SystemInfoService {
  static async getSystemInfo(tenant_id) { return SystemInfoRepository.getSystemInfo(tenant_id); }
}

export default SystemInfoService;
