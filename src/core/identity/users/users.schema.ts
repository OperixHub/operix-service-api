import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const userPublicSchema = z.object({
  id: z.number().nullable().optional(),
  username: z.string().min(1),
  email: z.string().email(),
  tenant: z.string().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  keycloak_id: z.string().nullable().optional(),
  admin: z.boolean().nullable().optional(),
  root: z.boolean().nullable().optional(),
  name: z.string().min(1),
}).openapi('UserPublic');

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

const userListResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.array(userPublicSchema),
}).openapi('UserListResponse');

export { userPublicSchema, userSchema, userListResponseSchema };
