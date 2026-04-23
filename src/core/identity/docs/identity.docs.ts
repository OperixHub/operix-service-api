import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { tenantCreateSchema, tenantListResponseSchema, tenantSchema } from '../tenants/tenants.schema.js';
import { userListResponseSchema, userPublicSchema } from '../users/users.schema.js';

export function registerIdentityDocs(registry: OpenAPIRegistry) {
  registry.register('User', userPublicSchema);
  registry.register('Tenant', tenantSchema);

  const security = [{ bearerAuth: [] }];

  registry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['Identidade'],
    security,
    responses: {
      200: {
        description: 'Lista de usuários',
        content: { 'application/json': { schema: userListResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    tags: ['Identidade'],
    security,
    responses: {
      204: { description: 'Usuário removido com sucesso' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/tenants',
    tags: ['Unidades'],
    security,
    responses: {
      200: {
        description: 'Lista de unidades',
        content: { 'application/json': { schema: tenantListResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/tenants',
    tags: ['Unidades'],
    security,
    request: { body: { content: { 'application/json': { schema: tenantCreateSchema } }, required: true } },
    responses: {
      201: { description: 'Unidade criada com sucesso' },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/tenants/{id}',
    tags: ['Unidades'],
    security,
    responses: {
      204: { description: 'Unidade removida com sucesso' },
    },
  });
}
