import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerInventarioDocs } from '../../modules/inventario/docs/inventario.docs.js';
import { registerNotificacoesDocs } from '../../modules/notificacoes/docs/notificacoes.docs.js';
import { registerOperacionalDocs } from '../../modules/operacional/docs/operacional.docs.js';
import { registerAuthDocs } from '../autenticacao/docs/autenticacao.docs.js';
import { registerProfileDocs } from '../perfil/docs/perfil.docs.js';
import { registerLogsDocs } from '../registros/docs/registros.docs.js';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registerOperacionalDocs(registry);
registerInventarioDocs(registry);
registerProfileDocs(registry);
registerNotificacoesDocs(registry);
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
      { name: 'Estoque', description: '[Module:Inventario] Endpoints de cadastro, listagem, atualização e remoção de itens de estoque.' },
      { name: 'Notificações', description: '[Module:Notificacoes] Endpoints de informações do sistema e base para futuros canais como e-mail e WhatsApp.' },
      { name: 'Serviços', description: '[Module:Operacional] Endpoints de gerenciamento de serviços, status operacionais e fluxo de almoxarifado.' },
      { name: 'Ordens de Serviço', description: '[Module:Operacional] Endpoints de consulta e manutenção de ordens de serviço e seus orçamentos.' },
      { name: 'Status de Serviço', description: '[Module:Operacional] Endpoints de gerenciamento dos status utilizados no ciclo de atendimento dos serviços.' },
      { name: 'Status de Pagamento', description: '[Module:Operacional] Endpoints de gerenciamento dos status de pagamento aplicados aos serviços.' },
      { name: 'Tipos de Produtos', description: '[Module:Operacional] Endpoints de gerenciamento dos tipos de produtos utilizados pelos serviços.' },
    ],
    servers: [
      { url: 'http://localhost:3333/api', description: 'Ambiente local' },
    ],
  });
}
