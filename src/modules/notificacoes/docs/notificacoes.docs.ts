import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerNotificacoesDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/informacoes-sistema', tags: ['Notificações'], security, responses: { 200: { description: 'Informações do sistema' } } });
}
