import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registerOperationalDocs } from '../../modules/operational/docs/operational.docs.js';
import { registerInventoryDocs } from '../../modules/inventory/docs/inventory.docs.js';
import { registerIdentityDocs } from '../identity/docs/identity.docs.js';
import { registerNotificationsDocs } from '../../modules/notifications/docs/notifications.docs.js';
import { registerLogsDocs } from '../logs/docs/logs.docs.js';
import { registerAuthDocs } from '../auth/docs/auth.docs.js';

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
      version: '1.0.0',
      title: 'Operix API (Modular)',
      description: 'API do sistema de gestão inteligente (Monolito Modular via Keycloak).',
      contact: {
        name: 'João Pedro P. Lima',
        email: 'devx.contato@gmail.com',
      },
    },
    servers: [
      { url: 'http://localhost:3333/api', description: 'Desenvolvimento Backend APIs' }
    ],
  });
}
