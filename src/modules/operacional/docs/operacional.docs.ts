import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { orderOfServiceListResponseSchema, orderOfServiceSchema } from '../ordem-servico/ordem-servico.schema.js';
import { serviceCreateSchema, serviceListResponseSchema, serviceSchema } from '../servicos/servicos.schema.js';
import { statusPaymentSchema } from '../status-pagamento/status-pagamento.schema.js';
import { statusServiceSchema } from '../status-servico/status-servico.schema.js';
import { typeProductSchema } from '../tipos-produto/tipos-produto.schema.js';

export function registerOperacionalDocs(registry: OpenAPIRegistry) {
  // Register Models
  registry.register('Service', serviceSchema);
  registry.register('OrdemServico', orderOfServiceSchema);
  registry.register('StatusServico', statusServiceSchema);
  registry.register('StatusPagamento', statusPaymentSchema);
  registry.register('TypeProduct', typeProductSchema);

  const security = [{ bearerAuth: [] }];

  // Services
  registry.registerPath({ method: 'get', path: '/servicos', tags: ['Serviços'], security, responses: { 200: { content: { 'application/json': { schema: serviceListResponseSchema } }, description: 'Serviços listados' } } });
  registry.registerPath({ method: 'get', path: '/servicos/almoxarifado', tags: ['Serviços'], security, responses: { 200: { content: { 'application/json': { schema: serviceListResponseSchema } }, description: 'Serviços almoxerifado' } } });
  registry.registerPath({ method: 'post', path: '/servicos', tags: ['Serviços'], security, request: { body: { content: { 'application/json': { schema: serviceCreateSchema } }, required: true } }, responses: { 201: { description: 'Serviço criado' } } });

  // Basic empty registrations for the rest to keep it simple
  registry.registerPath({ method: 'put', path: '/servicos/almoxarifado/{id}/{value}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/servicos/info/cliente/{id}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/servicos/status/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/servicos/status/pagamento/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/servicos/{id}/{cod}/{typeTable}', tags: ['Serviços'], security, responses: { 204: { description: 'Removido' } } });

  // Order of service
  registry.registerPath({ method: 'get', path: '/ordem-servico', tags: ['Ordens de Serviço'], security, responses: { 200: { content: { 'application/json': { schema: orderOfServiceListResponseSchema } }, description: 'Lista' } } });
  registry.registerPath({ method: 'get', path: '/ordem-servico/{cod}', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'Detalhe' } } });
  registry.registerPath({ method: 'put', path: '/ordem-servico/orcamento/{cod}', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/ordem-servico/orcamento/{cod}/{idEstimate}', tags: ['Ordens de Serviço'], security, responses: { 204: { description: 'OK' } } });

  // Status Service
  registry.registerPath({ method: 'get', path: '/status-servico', tags: ['Status de Serviço'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/status-servico', tags: ['Status de Serviço'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/status-servico/{id}', tags: ['Status de Serviço'], security, responses: { 204: { description: 'OK' } } });

  // Status Payment
  registry.registerPath({ method: 'get', path: '/status-pagamento', tags: ['Status de Pagamento'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/status-pagamento', tags: ['Status de Pagamento'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/status-pagamento/{id}', tags: ['Status de Pagamento'], security, responses: { 204: { description: 'OK' } } });

  // Types Product
  registry.registerPath({ method: 'get', path: '/tipos-produto', tags: ['Tipos de Produtos'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/tipos-produto', tags: ['Tipos de Produtos'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/tipos-produto/{id}', tags: ['Tipos de Produtos'], security, responses: { 204: { description: 'OK' } } });
}
