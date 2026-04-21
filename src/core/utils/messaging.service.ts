import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export default class MessagingService {
  /**
   * Inicializa o serviÃ§o com a instÃ¢ncia do socket.io.
   * Deve ser chamado uma Ãºnica vez no bootstrap da aplicaÃ§Ã£o.
   */
  static init(io: Server) {
    ioInstance = io;
  }

  /**
   * Dispara um evento real-time isolado apenas para os clientes de um Tenant especÃ­fico.
   */
  static notifyTenant(tenantId: string | number | null, eventName: string, payload: any) {
    if (ioInstance && tenantId) {
      ioInstance.to(`tenant_${tenantId}`).emit(eventName, payload);
    }
  }

  /**
   * Dispara um aviso global em tempo real (ex: manutenÃ§Ã£o de servidor).
   */
  static notifyAll(eventName: string, payload: any) {
    if (ioInstance) {
      ioInstance.emit(eventName, payload);
    }
  }
}
