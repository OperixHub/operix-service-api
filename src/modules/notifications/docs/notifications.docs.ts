import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerNotificationsDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/notifications/notifications', tags: ['Utilitários'], security, responses: { 200: { description: 'Notificações' } } });
}
