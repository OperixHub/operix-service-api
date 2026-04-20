import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import AuthModel from '../auth.model.js';

export function registerAuthDocs(registry: OpenAPIRegistry) {
  registry.register('AuthLogin', AuthModel.loginSchema);
  registry.register('AuthRegister', AuthModel.registerSchema);
  registry.register('AuthRefresh', AuthModel.refreshSchema);

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['AutenticaÃ§Ã£o'],
    request: { body: { content: { 'application/json': { schema: AuthModel.loginSchema } }, required: true } },
    responses: {
      200: {
        description: 'Login realizado com sucesso',
        content: { 'application/json': { schema: AuthModel.loginResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/register',
    tags: ['AutenticaÃ§Ã£o'],
    request: { body: { content: { 'application/json': { schema: AuthModel.registerSchema } }, required: true } },
    responses: {
      201: {
        description: 'UsuÃ¡rio criado com sucesso',
        content: { 'application/json': { schema: AuthModel.registerResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/refresh',
    tags: ['AutenticaÃ§Ã£o'],
    request: { body: { content: { 'application/json': { schema: AuthModel.refreshSchema } }, required: true } },
    responses: {
      200: {
        description: 'Refresh token realizado com sucesso',
        content: { 'application/json': { schema: AuthModel.refreshResponseSchema } },
      },
    },
  });
}
