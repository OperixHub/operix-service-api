import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class AuthModel {
  static loginSchema = z.object({
    username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
    password: z.string().min(1, 'Campo "Senha" é obrigatório.'),
    remember: z.boolean().optional(),
  }).openapi('AuthLogin');

  static registerSchema = z.object({
    name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
    username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
    email: z.string().email('Campo "Email" inválido.'),
    password: z.string().min(8, 'Campo "Senha" deve ter no mínimo 8 caracteres.'),
    tenant: z.string().min(1, 'Campo "Tenant" é obrigatório.'),
  }).openapi('AuthRegister');

  static refreshSchema = z.object({
    refresh_token: z.string().min(1, 'Campo "Refresh token" é obrigatório.'),
  }).openapi('AuthRefresh');

  static loginResponseSchema = z.object({
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

  static registerResponseSchema = z.object({
    success: z.boolean(),
    msg: z.string(),
    data: z.object({
      id: z.number().nullable().optional(),
      name: z.string().nullable().optional(),
      username: z.string(),
      email: z.string().email(),
      tenant: z.string().nullable().optional(),
      tenant_id: z.number().nullable().optional(),
      keycloak_id: z.string().nullable().optional(),
      admin: z.boolean().optional(),
      root: z.boolean().optional(),
    }).nullable(),
  }).openapi('AuthRegisterResponse');

  static refreshResponseSchema = z.object({
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
}
