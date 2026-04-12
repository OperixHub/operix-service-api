import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import StockModel from '../stock/stock.model.js';

export function registerInventoryDocs(registry: OpenAPIRegistry) {
  registry.register('Stock', StockModel.schema);
  const security = [{ bearerAuth: [] }];

  registry.registerPath({ method: 'get', path: '/inventory/stock', tags: ['Estoque'], security, responses: { 200: { content: { 'application/json': { schema: StockModel.listResponseSchema } }, description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/inventory/stock', tags: ['Estoque'], security, request: { body: { content: { 'application/json': { schema: StockModel.createSchema } }, required: true } }, responses: { 201: { description: 'Criado' } } });
  registry.registerPath({ method: 'put', path: '/inventory/stock/{id}', tags: ['Estoque'], security, responses: { 200: { description: 'Atualizado' } } });
  registry.registerPath({ method: 'delete', path: '/inventory/stock/{id}', tags: ['Estoque'], security, responses: { 204: { description: 'Removido' } } });
}
