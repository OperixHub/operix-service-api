import { Server } from "socket.io";

let ioInstance: Server | null = null;

export default class MessagingService {
  /**
   * Inicializa o serviço com a instância do socket.io.
   */
  static init(io: Server) {
    ioInstance = io;
  }

  /**
   * Dispara um evento real-time isolado apenas para os Dashboards/Frontend de uma Unidade (Tenant) específica.
   */
  static notifyTenant(tenantId: string | number | null, eventName: string, payload: any) {
    if (ioInstance && tenantId) {
      ioInstance.to(`tenant_${tenantId}`).emit(eventName, payload);
    }
  }

  /**
   * Dispara um aviso global em tempo real (ex: manutenção de servidor)
   */
  static notifyAll(eventName: string, payload: any) {
    if (ioInstance) {
      ioInstance.emit(eventName, payload);
    }
  }
}
