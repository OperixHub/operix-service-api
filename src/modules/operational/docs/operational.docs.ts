import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { orderOfServiceListResponseSchema, orderOfServiceSchema } from '../order-of-service/order-of-service.schema.js';
import { serviceCreateSchema, serviceListResponseSchema, serviceSchema } from '../services/services.schema.js';
import { statusPaymentSchema } from '../status-payment/status-payment.schema.js';
import { statusServiceSchema } from '../status-service/status-service.schema.js';
import { typeProductSchema } from '../types-product/types-product.schema.js';

export function registerOperationalDocs(registry: OpenAPIRegistry) {
  // Register Models
  registry.register('Service', serviceSchema);
  registry.register('OrderOfService', orderOfServiceSchema);
  registry.register('StatusService', statusServiceSchema);
  registry.register('StatusPayment', statusPaymentSchema);
  registry.register('TypeProduct', typeProductSchema);

  const security = [{ bearerAuth: [] }];

  // Services
  registry.registerPath({ method: 'get', path: '/services', tags: ['Serviços'], security, responses: { 200: { content: { 'application/json': { schema: serviceListResponseSchema } }, description: 'Serviços listados' } } });
  registry.registerPath({ method: 'get', path: '/services/warehouse', tags: ['Serviços'], security, responses: { 200: { content: { 'application/json': { schema: serviceListResponseSchema } }, description: 'Serviços almoxerifado' } } });
  registry.registerPath({ method: 'post', path: '/services', tags: ['Serviços'], security, request: { body: { content: { 'application/json': { schema: serviceCreateSchema } }, required: true } }, responses: { 201: { description: 'Serviço criado' } } });

  // Basic empty registrations for the rest to keep it simple
  registry.registerPath({ method: 'put', path: '/services/warehouse/{id}/{value}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/services/info/client/{id}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/services/status/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/services/status/payment/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/services/{id}/{cod}/{typeTable}', tags: ['Serviços'], security, responses: { 204: { description: 'Removido' } } });

  // Order of service
  registry.registerPath({ method: 'get', path: '/order-of-service', tags: ['Ordens de Serviço'], security, responses: { 200: { content: { 'application/json': { schema: orderOfServiceListResponseSchema } }, description: 'Lista' } } });
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
