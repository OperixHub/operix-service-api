import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  companySettingsResponseSchema,
  companySettingsUpdateSchema,
  profileMeResponseSchema,
  profileSystemResponseSchema,
  userProfileUpdateSchema,
} from '../profile-settings.schema.ts';
import { tenantCreateSchema, tenantListResponseSchema, tenantSchema } from '../tenants/tenants.schema.ts';
import {
  userAccessUpdateSchema,
  userCreateSchema,
  userListResponseSchema,
  userPublicSchema,
  userResponseSchema,
} from '../users/users.schema.ts';
import {
  permissionOverridesUpdateSchema,
  permissionsCatalogResponseSchema,
  permissionsMeResponseSchema,
  permissionsUserResponseSchema,
} from '../permissions/permissions.schema.ts';

export function registerProfileDocs(registry: OpenAPIRegistry) {
  registry.register('User', userPublicSchema);
  registry.register('Tenant', tenantSchema);

  const security = [{ bearerAuth: [] }];

  registry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['Usuários'],
    security,
    responses: {
      200: {
        description: 'Lista de usuários',
        content: { 'application/json': { schema: userListResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/users',
    tags: ['Usuários'],
    security,
    request: {
      body: {
        content: { 'application/json': { schema: userCreateSchema } },
        required: true,
      },
    },
    responses: {
      201: {
        description: 'Usuário criado com sucesso',
        content: { 'application/json': { schema: userResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    tags: ['Usuários'],
    security,
    responses: {
      204: { description: 'Usuário removido com sucesso' },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/users/{id}/access',
    tags: ['Usuários'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: userAccessUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Acesso do usuário atualizado com sucesso',
        content: { 'application/json': { schema: userResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/profile/me',
    tags: ['Usuários'],
    security,
    responses: {
      200: {
        description: 'Perfil do usuário autenticado',
        content: { 'application/json': { schema: profileMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/profile/me',
    tags: ['Usuários'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: userProfileUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Perfil do usuário atualizado com sucesso',
        content: { 'application/json': { schema: profileMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/profile/company',
    tags: ['Unidades'],
    security,
    responses: {
      200: {
        description: 'Empresa do tenant autenticado',
        content: { 'application/json': { schema: companySettingsResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/profile/company',
    tags: ['Unidades'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: companySettingsUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Empresa atualizada com sucesso',
        content: { 'application/json': { schema: companySettingsResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/profile/system',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Configurações e catálogo efetivo do sistema',
        content: { 'application/json': { schema: profileSystemResponseSchema } },
      },
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
