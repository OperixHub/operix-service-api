import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import ServiceModel from '../services/services.model.js';
import OrderOfServiceModel from '../order-of-service/order-of-service.model.js';
import StatusServiceModel from '../status-service/status-service.model.js';
import StatusPaymentModel from '../status-payment/status-payment.model.js';
import TypesProductModel from '../types-product/types-product.model.js';

export function registerOperationalDocs(registry: OpenAPIRegistry) {
  // Register Models
  registry.register('Service', ServiceModel.schema);
  registry.register('OrderOfService', OrderOfServiceModel.schema);
  registry.register('StatusService', StatusServiceModel.schema);
  registry.register('StatusPayment', StatusPaymentModel.schema);
  registry.register('TypeProduct', TypesProductModel.schema);

  const security = [{ bearerAuth: [] }];

  // Services
  registry.registerPath({ method: 'get', path: '/services', tags: ['Serviços'], security, responses: { 200: { content: { 'application/json': { schema: ServiceModel.listResponseSchema } }, description: 'Serviços listados' } } });
  registry.registerPath({ method: 'get', path: '/services/warehouse', tags: ['Serviços'], security, responses: { 200: { content: { 'application/json': { schema: ServiceModel.listResponseSchema } }, description: 'Serviços almoxerifado' } } });
  registry.registerPath({ method: 'post', path: '/services', tags: ['Serviços'], security, request: { body: { content: { 'application/json': { schema: ServiceModel.createSchema } }, required: true } }, responses: { 201: { description: 'Serviço criado' } } });

  // Basic empty registrations for the rest to keep it simple
  registry.registerPath({ method: 'put', path: '/services/warehouse/{id}/{value}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/services/info/client/{id}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/services/status/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/services/status/payment/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/services/{id}/{cod}/{typeTable}', tags: ['Serviços'], security, responses: { 204: { description: 'Removido' } } });

  // Order of service
  registry.registerPath({ method: 'get', path: '/order-of-service', tags: ['Ordens de Serviço'], security, responses: { 200: { content: { 'application/json': { schema: OrderOfServiceModel.listResponseSchema } }, description: 'Lista' } } });
  registry.registerPath({ method: 'get', path: '/order-of-service/{cod}', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'Detalhe' } } });
  registry.registerPath({ method: 'put', path: '/order-of-service/estimate/{cod}', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/order-of-service/estimate/{cod}/{idEstimate}', tags: ['Ordens de Serviço'], security, responses: { 204: { description: 'OK' } } });

  // Status Service
  registry.registerPath({ method: 'get', path: '/status-service', tags: ['Status de Serviço'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/status-service', tags: ['Status de Serviço'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/status-service/{id}', tags: ['Status de Serviço'], security, responses: { 204: { description: 'OK' } } });

  // Status Payment
  registry.registerPath({ method: 'get', path: '/status-payment', tags: ['Status de Pagamento'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/status-payment', tags: ['Status de Pagamento'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/status-payment/{id}', tags: ['Status de Pagamento'], security, responses: { 204: { description: 'OK' } } });

  // Types Product
  registry.registerPath({ method: 'get', path: '/types-product', tags: ['Tipos de Produtos'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/types-product', tags: ['Tipos de Produtos'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/types-product/{id}', tags: ['Tipos de Produtos'], security, responses: { 204: { description: 'OK' } } });
}
