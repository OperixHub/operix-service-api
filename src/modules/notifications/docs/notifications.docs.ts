import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerNotificationsDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/system-info', tags: ['Notificações'], security, responses: { 200: { description: 'Informações do sistema' } } });
}
