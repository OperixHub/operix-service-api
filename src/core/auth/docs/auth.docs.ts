import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import AuthModel from '../auth.model.js';

export function registerAuthDocs(registry: OpenAPIRegistry) {
  registry.register('AuthLogin', AuthModel.loginSchema);
  registry.register('AuthRegister', AuthModel.registerSchema);
  const security = [{ bearerAuth: [] }];

  registry.registerPath({ method: 'post', path: '/auth/login', tags: ['Autenticação'], security, request: { body: { content: { 'application/json': { schema: AuthModel.loginSchema } }, required: true } }, responses: { 200: { description: 'Login realizado com sucesso' } } });
  registry.registerPath({ method: 'post', path: '/auth/register', tags: ['Autenticação'], security, request: { body: { content: { 'application/json': { schema: AuthModel.registerSchema } }, required: true } }, responses: { 201: { description: 'Usuário criado com sucesso' } } });
}