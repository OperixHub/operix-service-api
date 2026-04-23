import { buildApiListResponseSchema, buildApiResponseSchema } from '../../schemas/api-response.schema.js';
import { z } from '../../schemas/zod-openapi.js';
import { manageableModuleKeys } from '../../permissions/permissions.catalog.js';

const userSchema = z.object({
  id: z.number().nullable().optional(),
  username: z.string().min(1),
  email: z.string().email(),
  tenant: z.string().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  keycloak_id: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  admin: z.boolean().nullable().optional(),
  root: z.boolean().nullable().optional(),
  name: z.string().min(1),
}).openapi('User');

const userPublicSchema = userSchema.omit({
  password: true,
}).openapi('UserPublic');

const userCreateSchema = z.object({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
  username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
  email: z.string().email('Campo "Email" inválido.'),
  password: z.string().min(8, 'Campo "Senha" deve ter no mínimo 8 caracteres.'),
  admin: z.boolean().optional().default(false),
  modules: z.array(z.enum(manageableModuleKeys)).optional().default([]),
}).openapi('UserCreate');

const userListResponseSchema = buildApiListResponseSchema(userPublicSchema, 'UserListResponse');
const userResponseSchema = buildApiResponseSchema(userPublicSchema, 'UserResponse');

export { userCreateSchema, userPublicSchema, userResponseSchema, userSchema, userListResponseSchema };
