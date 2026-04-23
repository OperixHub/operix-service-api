import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  permissionOverridesUpdateSchema,
  permissionsCatalogResponseSchema,
  permissionsMeResponseSchema,
  permissionsUserResponseSchema,
} from './permissions.schema.js';

export function registerPermissionsDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];

  registry.registerPath({
    method: 'get',
    path: '/permissions/me',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Permissões efetivas do usuário autenticado',
        content: { 'application/json': { schema: permissionsMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/permissions/catalog',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Catálogo de permissões e módulos gerenciáveis',
        content: { 'application/json': { schema: permissionsCatalogResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/permissions/users/{id}',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Perfil de permissões de um usuário do tenant',
        content: { 'application/json': { schema: permissionsUserResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/permissions/users/{id}',
    tags: ['Permissões'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: permissionOverridesUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Overrides de permissões atualizados com sucesso',
        content: { 'application/json': { schema: permissionsUserResponseSchema } },
      },
    },
  });
}
