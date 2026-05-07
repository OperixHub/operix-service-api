import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { buildApiResponseSchema } from '../schemas/api-response.schema.js';
import { sanitizedUserSchema } from '../profile/users/users.schema.js';

extendZodWithOpenApi(z);

const authLoginSchema = z.object({
  username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
  password: z.string().min(1, 'Campo "Senha" é obrigatório.'),
  remember: z.boolean().optional(),
}).openapi('AuthLogin');

const authRefreshSchema = z.object({
  refresh_token: z.string().min(1, 'Campo "Refresh token" é obrigatório.'),
}).openapi('AuthRefresh');

const authAuthorizeSchema = z.object({
  redirect_uri: z.string().url('Campo "redirect_uri" inválido.'),
  state: z.string().min(1, 'Campo "state" é obrigatório.'),
  code_challenge: z.string().min(16, 'Campo "code_challenge" é obrigatório.'),
  identity_provider: z.string().optional(),
}).openapi('AuthAuthorize');

const authCallbackSchema = z.object({
  code: z.string().min(1, 'Campo "code" é obrigatório.'),
  redirect_uri: z.string().url('Campo "redirect_uri" inválido.'),
  code_verifier: z.string().min(16, 'Campo "code_verifier" é obrigatório.'),
}).openapi('AuthCallback');

const onboardingSchema = z.object({
  company_name: z.string().min(1, 'Campo "Nome da empresa" é obrigatório.'),
  cnpj: z.string().max(20).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
}).openapi('Onboarding');

const publicAuthConfigDataSchema = z.object({
  deployment_mode: z.string(),
  tenant_count: z.number(),
  registration_enabled: z.boolean(),
  onboarding_enabled: z.boolean(),
  local_instance_configured: z.boolean(),
  keycloak: z.object({
    realm: z.string(),
    client_id: z.string(),
    url: z.string(),
  }),
}).openapi('PublicAuthConfigData');

const authSessionDataSchema = z.object({
  token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().optional(),
  refresh_expires_in: z.number().optional(),
  token_type: z.string().optional(),
  user: sanitizedUserSchema.nullable().optional(),
}).openapi('AuthSessionData');

const authRefreshDataSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().optional(),
  refresh_expires_in: z.number().optional(),
  token_type: z.string().optional(),
}).openapi('AuthRefreshData');

const authAuthorizeResponseSchema = buildApiResponseSchema(
  z.object({
    authorization_url: z.string().url(),
  }),
  'AuthAuthorizeResponse',
);

const authConfigResponseSchema = buildApiResponseSchema(publicAuthConfigDataSchema, 'AuthConfigResponse');
const authLoginResponseSchema = buildApiResponseSchema(authSessionDataSchema, 'AuthLoginResponse');
const authCallbackResponseSchema = buildApiResponseSchema(authSessionDataSchema, 'AuthCallbackResponse');
const authRefreshResponseSchema = buildApiResponseSchema(authRefreshDataSchema, 'AuthRefreshResponse');
const authMeResponseSchema = buildApiResponseSchema(z.object({
  user: sanitizedUserSchema.nullable(),
  permissions: z.array(z.string()),
  access: z.any().optional(),
}), 'AuthMeResponse');
const authOnboardingResponseSchema = buildApiResponseSchema(sanitizedUserSchema.nullable(), 'AuthOnboardingResponse');

export {
  authAuthorizeResponseSchema,
  authLoginSchema,
  authCallbackResponseSchema,
  authRefreshSchema,
  authAuthorizeSchema,
  authCallbackSchema,
  authConfigResponseSchema,
  authMeResponseSchema,
  authOnboardingResponseSchema,
  authSessionDataSchema,
  onboardingSchema,
  authLoginResponseSchema,
  authRefreshResponseSchema,
};
