import { buildApiListResponseSchema } from '../../schemas/api-response.schema.js';
import { z } from '../../schemas/zod-openapi.js';

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

const userListResponseSchema = buildApiListResponseSchema(userPublicSchema, 'UserListResponse');

export { userPublicSchema, userSchema, userListResponseSchema };
