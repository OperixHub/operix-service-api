import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerInventoryDocs } from '../../modules/inventory/docs/inventory.docs.js';
import { registerNotificationsDocs } from '../../modules/notifications/docs/notifications.docs.js';
import { registerOperationalDocs } from '../../modules/operational/docs/operational.docs.js';
import { registerAuthDocs } from '../auth/docs/auth.docs.js';
import { registerIdentityDocs } from '../identity/docs/identity.docs.js';
import { registerLogsDocs } from '../logs/docs/logs.docs.js';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registerOperationalDocs(registry);
registerInventoryDocs(registry);
registerIdentityDocs(registry);
registerNotificationsDocs(registry);
registerAuthDocs(registry);
registerLogsDocs(registry);

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.1.0',
      title: 'Operix Service API',
      description: 'API RESTful do sistema de gestão Operix com autenticação via Keycloak, documentação OpenAPI e isolamento multi-tenant.',
      contact: {
        name: 'João Pedro P. Lima',
        email: 'devx.contato@gmail.com',
      },
    },
    tags: [
      { name: 'Autenticação', description: '[Core]' },
      { name: 'Identidade', description: '[Core]' },
      { name: 'Unidades', description: '[Core]' },
      { name: 'Logs', description: '[Core]' },
      { name: 'Estoque', description: '[Module Inventory]' },
      { name: 'Notificações', description: '[Module Notifications]' },
      { name: 'Serviços', description: '[Module Operational]' },
      { name: 'Ordens de Serviço', description: '[Module Operational]' },
      { name: 'Status de Serviço', description: '[Module Operational]' },
      { name: 'Status de Pagamento', description: '[Module Operational]' },
      { name: 'Tipos de Produtos', description: '[Module Operational]' },
    ],
    servers: [
      { url: 'http://localhost:3333/api', description: 'Ambiente local' },
    ],
  });
}
