import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import UserModel from '../users/users.model.js';
import TenantModel from '../tenants/tenants.model.js';

export function registerIdentityDocs(registry: OpenAPIRegistry) {
  registry.register('User', UserModel.schema);
  registry.register('Tenant', TenantModel.schema);
  const security = [{ bearerAuth: [] }];

  registry.registerPath({ method: 'get', path: '/identity/users', tags: ['Identidade'], security, responses: { 200: { content: { 'application/json': { schema: UserModel.listResponseSchema } }, description: 'Lista' } } });
  registry.registerPath({ method: 'get', path: '/identity/users/signature/{id}', tags: ['Identidade'], security, responses: { 200: { description: 'Assinatura' } } });
  registry.registerPath({ method: 'delete', path: '/identity/users/{id}', tags: ['Identidade'], security, responses: { 204: { description: 'Deletado' } } });

  registry.registerPath({ method: 'get', path: '/identity/tenants', tags: ['Unidades'], security, responses: { 200: { content: { 'application/json': { schema: TenantModel.listResponseSchema } }, description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/identity/tenants', tags: ['Unidades'], security, request: { body: { content: { 'application/json': { schema: TenantModel.createSchema } }, required: true } }, responses: { 201: { description: 'Criada' } } });
  registry.registerPath({ method: 'delete', path: '/identity/tenants/{id}', tags: ['Unidades'], security, responses: { 204: { description: 'Deletada' } } });
}
