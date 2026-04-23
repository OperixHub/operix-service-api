// @ts-nocheck
// Dependência cross-module: usa apenas a API pública (index.ts) do módulo operational
import { ServicesQueryService } from '../../operational/index.js';

class SystemInfoRepository {
  static async getSystemInfo(tenant_id) {
    const notConcluded = await ServicesQueryService.getNotConcluded(tenant_id);

    const currentDate = new Date();
    const ninetyDaysAgo = new Date(currentDate);
    ninetyDaysAgo.setDate(currentDate.getDate() - 90);

    const systemInfo = notConcluded.filter((service: any) => {
      const createdAt = new Date(service.created_at);
      return createdAt < ninetyDaysAgo;
    });

    return systemInfo;
  }
}

export default SystemInfoRepository;
