import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { stockCreateSchema, stockListResponseSchema, stockSchema } from '../stock/stock.schema.js';

export function registerInventoryDocs(registry: OpenAPIRegistry) {
  registry.register('Stock', stockSchema);
  const security = [{ bearerAuth: [] }];

  registry.registerPath({ method: 'get', path: '/stock', tags: ['Estoque'], security, responses: { 200: { content: { 'application/json': { schema: stockListResponseSchema } }, description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/stock', tags: ['Estoque'], security, request: { body: { content: { 'application/json': { schema: stockCreateSchema } }, required: true } }, responses: { 201: { description: 'Criado' } } });
  registry.registerPath({ method: 'put', path: '/stock/{id}', tags: ['Estoque'], security, responses: { 200: { description: 'Atualizado' } } });
  registry.registerPath({ method: 'delete', path: '/stock/{id}', tags: ['Estoque'], security, responses: { 204: { description: 'Removido' } } });
}
