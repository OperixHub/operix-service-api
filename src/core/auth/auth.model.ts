import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class AuthModel {
  static loginSchema = z.object({
    username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
    password: z.string().min(1, 'Campo "Senha" é obrigatório.'),
    remember: z.boolean().optional()
  }).openapi('AuthLogin');

  static registerSchema = z.object({
    name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
    username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
    email: z.string().email('Campo "Email" inválido.'),
    password: z.string().min(1, 'Campo "Senha" é obrigatório.'),
    tenant_id: z.number().nullable().optional() // Opciocional via admin, ou padrão
  }).openapi('AuthRegister');

  static loginResponseSchema = z.object({
    success: z.boolean(),
    msg: z.string(),
    data: z.object({
      token: z.string(),
      user: z.object({
        id: z.string().optional(),
        username: z.string(),
        email: z.string().optional(),
        tenant_id: z.number().optional()
      }).optional()
    })
  }).openapi('AuthLoginResponse');

  static registerResponseSchema = z.object({
    success: z.boolean(),
    msg: z.string()
  }).openapi('AuthRegisterResponse');
}
