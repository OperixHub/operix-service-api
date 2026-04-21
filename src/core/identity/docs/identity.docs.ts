import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import TenantModel from '../tenants/tenants.model.js';
import UserModel from '../users/users.model.js';

export function registerIdentityDocs(registry: OpenAPIRegistry) {
  registry.register('User', UserModel.publicSchema);
  registry.register('Tenant', TenantModel.schema);

  const security = [{ bearerAuth: [] }];

  registry.registerPath({
    method: 'get',
    path: '/identity/users',
    tags: ['Identidade'],
    security,
    responses: {
      200: {
        description: 'Lista de usuÃ¡rios',
        content: { 'application/json': { schema: UserModel.listResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/identity/users/{id}',
    tags: ['Identidade'],
    security,
    responses: {
      204: { description: 'UsuÃ¡rio removido com sucesso' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/identity/tenants',
    tags: ['Unidades'],
    security,
    responses: {
      200: {
        description: 'Lista de unidades',
        content: { 'application/json': { schema: TenantModel.listResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/identity/tenants',
    tags: ['Unidades'],
    security,
    request: { body: { content: { 'application/json': { schema: TenantModel.createSchema } }, required: true } },
    responses: {
      201: { description: 'Unidade criada com sucesso' },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/identity/tenants/{id}',
    tags: ['Unidades'],
    security,
    responses: {
      204: { description: 'Unidade removida com sucesso' },
    },
  });
}
