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
      { name: 'Autenticação', description: 'Núcleo Auth: autenticação e integração com Keycloak.' },
      { name: 'Identidade', description: 'Núcleo Identity: gerenciamento de usuários.' },
      { name: 'Unidades', description: 'Núcleo Identity: gerenciamento de unidades (tenants).' },
      { name: 'Logs', description: 'Núcleo Logs: consulta de logs da aplicação.' },
      { name: 'Estoque', description: 'Módulo Inventory: gerenciamento de estoque.' },
      { name: 'Utilitários', description: 'Módulo Notifications: utilitários e notificações.' },
      { name: 'Serviços', description: 'Módulo Operational: gerenciamento de serviços.' },
      { name: 'Ordens de Serviço', description: 'Módulo Operational: gerenciamento de ordens de serviço.' },
      { name: 'Status de Serviço', description: 'Módulo Operational: gerenciamento de status de serviço.' },
      { name: 'Status de Pagamento', description: 'Módulo Operational: gerenciamento de status de pagamento.' },
      { name: 'Tipos de Produtos', description: 'Módulo Operational: gerenciamento de tipos de produtos.' },
    ],
    servers: [
      { url: 'http://localhost:3333/api', description: 'Ambiente local' },
    ],
  });
}
