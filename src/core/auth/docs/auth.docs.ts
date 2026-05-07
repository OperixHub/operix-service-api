import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  authLoginResponseSchema,
  authLoginSchema,
  authRefreshResponseSchema,
  authRefreshSchema,
} from '../auth.schema.js';

export function registerAuthDocs(registry: OpenAPIRegistry) {
  registry.register('AuthLogin', authLoginSchema);
  registry.register('AuthRefresh', authRefreshSchema);

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authLoginSchema } }, required: true } },
    responses: {
      200: {
        description: 'Login realizado com sucesso',
        content: { 'application/json': { schema: authLoginResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/refresh',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authRefreshSchema } }, required: true } },
    responses: {
      200: {
        description: 'Refresh token realizado com sucesso',
        content: { 'application/json': { schema: authRefreshResponseSchema } },
      },
    },
  });
}
