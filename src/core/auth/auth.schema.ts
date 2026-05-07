import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

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

const authLoginResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.object({
    token: z.string(),
    refresh_token: z.string(),
    user: z.object({
      id: z.union([z.string(), z.number()]).optional(),
      name: z.string().nullable().optional(),
      username: z.string(),
      email: z.string().nullable().optional(),
      tenant_id: z.number().nullable().optional(),
      admin: z.boolean().optional(),
      roles: z.array(z.string()).optional(),
    }).nullable().optional(),
  }),
}).openapi('AuthLoginResponse');

const authRefreshResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number().optional(),
    refresh_expires_in: z.number().optional(),
    token_type: z.string().optional(),
  }),
}).openapi('AuthRefreshResponse');

export {
  authLoginSchema,
  authRefreshSchema,
  authAuthorizeSchema,
  authCallbackSchema,
  onboardingSchema,
  authLoginResponseSchema,
  authRefreshResponseSchema,
};
