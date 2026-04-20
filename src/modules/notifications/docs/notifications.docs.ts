import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerNotificationsDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/notifications/notifications', tags: ['UtilitÃ¡rios'], security, responses: { 200: { description: 'NotificaÃ§Ãµes' } } });
}
