import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerNotificationsDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/notifications', tags: ['Notificações'], security, responses: { 200: { description: 'Notificações' } } });
}
