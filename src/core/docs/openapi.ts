import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerInventoryDocs } from '../../modules/inventory/docs/inventory.docs.js';
import { registerNotificationsDocs } from '../../modules/notifications/docs/notifications.docs.js';
import { registerOperationalDocs } from '../../modules/operational/docs/operational.docs.js';
import { registerAuthDocs } from '../auth/docs/auth.docs.js';
import { registerProfileDocs } from '../profile/docs/profile.docs.js';
import { registerLogsDocs } from '../logs/docs/logs.docs.js';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registerOperationalDocs(registry);
registerInventoryDocs(registry);
registerProfileDocs(registry);
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
      { name: 'Autenticação', description: '[Core:Auth] Endpoints de login, cadastro de usuário e renovação de token via integração com Keycloak.' },
      { name: 'Usuários', description: '[Core:Profile] Endpoints de consulta e remoção de usuários vinculados ao tenant autenticado.' },
      { name: 'Unidades', description: '[Core:Profile] Endpoints de gerenciamento das unidades da aplicação, representadas como tenants.' },
      { name: 'Permissões', description: '[Core:Profile] Endpoints para resolver permissões efetivas, catálogo de acesso e overrides por usuário.' },
      { name: 'Logs', description: '[Core:Logs] Endpoints para consulta paginada de logs e rastreamento de eventos da aplicação.' },
      { name: 'Estoque', description: '[Module:Inventory] Endpoints de cadastro, listagem, atualização e remoção de itens de estoque.' },
      { name: 'Notificações', description: '[Module:Notifications] Endpoints de informações do sistema e base para futuros canais como e-mail e WhatsApp.' },
      { name: 'Serviços', description: '[Module:Operational] Endpoints de gerenciamento de serviços, status operacionais e fluxo de almoxarifado.' },
      { name: 'Ordens de Serviço', description: '[Module:Operational] Endpoints de consulta e manutenção de ordens de serviço e seus orçamentos.' },
      { name: 'Status de Serviço', description: '[Module:Operational] Endpoints de gerenciamento dos status utilizados no ciclo de atendimento dos serviços.' },
      { name: 'Status de Pagamento', description: '[Module:Operational] Endpoints de gerenciamento dos status de pagamento aplicados aos serviços.' },
      { name: 'Tipos de Produtos', description: '[Module:Operational] Endpoints de gerenciamento dos tipos de produtos utilizados pelos serviços.' },
    ],
    servers: [
      { url: 'http://localhost:3333/api', description: 'Ambiente local' },
    ],
  });
}
