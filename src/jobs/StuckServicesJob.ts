import cron from "node-cron";
import TenantsRepository from "../repositories/TenantsRepository.js";
import ToolsRepository from "../repositories/ToolsRepository.js";
import MessagingService from "../services/MessagingService.js";

export default class StuckServicesJob {
  /**
   * Inicializa o cron job que roda de 1 em 1 hora (no minuto 0).
   * Ele varre as OS atrasadas de cada loja e empurra para os clients logados.
   */
  static init() {
    // "0 * * * *" = Roda a cada virada de hora (ex: 13:00, 14:00)
    cron.schedule("0 * * * *", async () => {
      console.log("[Job: StuckServices] Iniciando varredura periódica de serviços parados...");
      try {
        const tenants = await TenantsRepository.getAll();
        
        for (const tenant of tenants) {
          const notifications = await ToolsRepository.getNotifications(tenant.id);
          
          if (notifications && notifications.length > 0) {
            MessagingService.notifyTenant(
              tenant.id, 
              "@service/stuck_services_alert", 
              { count: notifications.length, services: notifications }
            );
          }
        }
      } catch (err) {
        console.error("[Job: StuckServices] Erro ao varrer serviços parados:", err);
      }
    });
  }
}
