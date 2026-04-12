// @ts-nocheck
import connection from '../../../core/database/connection.js';
// Dependência cross-module: usa apenas a API pública (index.ts) do módulo operational
import { ServicesQueryService } from '../../operational/index.js';

class ToolsRepository {
  static async getNotifications(tenant_id) {
    const notConcluded = await ServicesQueryService.getNotConcluded(tenant_id);

    const currentDate = new Date();
    const ninetyDaysAgo = new Date(currentDate);
    ninetyDaysAgo.setDate(currentDate.getDate() - 90);

    const notifications = notConcluded.filter((service: any) => {
      const createdAt = new Date(service.created_at);
      return createdAt < ninetyDaysAgo;
    });

    return notifications;
  }
}

export default ToolsRepository;
