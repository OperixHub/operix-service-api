import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  authAuthorizeResponseSchema,
  authAuthorizeSchema,
  authCallbackResponseSchema,
  authCallbackSchema,
  authConfigResponseSchema,
  authLoginResponseSchema,
  authLoginSchema,
  authMeResponseSchema,
  authOnboardingResponseSchema,
  authRefreshResponseSchema,
  authRefreshSchema,
  onboardingSchema,
} from '../auth.schema.js';

export function registerAuthDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];

  registry.register('AuthAuthorize', authAuthorizeSchema);
  registry.register('AuthCallback', authCallbackSchema);
  registry.register('AuthLogin', authLoginSchema);
  registry.register('AuthRefresh', authRefreshSchema);
  registry.register('Onboarding', onboardingSchema);

  registry.registerPath({
    method: 'get',
    path: '/auth/config',
    tags: ['Autenticação'],
    responses: {
      200: {
        description: 'Configuração pública de autenticação carregada com sucesso',
        content: { 'application/json': { schema: authConfigResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/authorize',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authAuthorizeSchema } }, required: true } },
    responses: {
      200: {
        description: 'URL de autenticação gerada com sucesso',
        content: { 'application/json': { schema: authAuthorizeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/callback',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authCallbackSchema } }, required: true } },
    responses: {
      200: {
        description: 'Callback do provedor autenticado com sucesso',
        content: { 'application/json': { schema: authCallbackResponseSchema } },
      },
    },
  });

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

  registry.registerPath({
    method: 'get',
    path: '/auth/me',
    tags: ['Autenticação'],
    security,
    responses: {
      200: {
        description: 'Sessão autenticada carregada com sucesso',
        content: { 'application/json': { schema: authMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/onboarding',
    tags: ['Autenticação'],
    security,
    request: { body: { content: { 'application/json': { schema: onboardingSchema } }, required: true } },
    responses: {
      201: {
        description: 'Onboarding concluído com sucesso',
        content: { 'application/json': { schema: authOnboardingResponseSchema } },
      },
    },
  });
}
