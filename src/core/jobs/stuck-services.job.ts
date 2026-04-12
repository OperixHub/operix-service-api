import cron from 'node-cron';
// Usa apenas as APIs públicas dos módulos (nunca internals)
import { ServicesQueryService } from '../../modules/operational/index.js';
import TenantsRepository from '../../modules/organization/tenants/tenants.repository.js';
import MessagingService from '../utils/messaging.service.js';

export default class StuckServicesJob {
  /**
   * Inicializa o cron job que roda a cada hora.
   * Varre OS paradas de cada tenant e empurra notificações via Socket.io.
   */
  static init() {
    cron.schedule('0 * * * *', async () => {
      console.log('[Job: StuckServices] Iniciando varredura periódica de serviços parados...');
      try {
        const tenants = await TenantsRepository.getAll();
        for (const tenant of tenants) {
          const notConcluded = await ServicesQueryService.getNotConcluded(tenant.id);
          const currentDate = new Date();
          const ninetyDaysAgo = new Date(currentDate);
          ninetyDaysAgo.setDate(currentDate.getDate() - 90);

          const notifications = notConcluded.filter((s: any) => new Date(s.created_at) < ninetyDaysAgo);
          if (notifications.length > 0) {
            MessagingService.notifyTenant(tenant.id, '@service/stuck_services_alert', { count: notifications.length, services: notifications });
          }
        }
      } catch (err) {
        console.error('[Job: StuckServices] Erro ao varrer serviços parados:', err);
      }
    });
  }
}
