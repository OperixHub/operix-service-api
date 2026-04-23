import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const tenantSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(1),
  keycloak_group_id: z.string().nullable().optional(),
}).openapi('Tenant');

const tenantCreateSchema = z.object({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
}).openapi('TenantCreate');

const tenantResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: tenantSchema,
}).openapi('TenantResponse');

const tenantListResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.array(tenantSchema),
}).openapi('TenantListResponse');

export { tenantSchema, tenantCreateSchema, tenantResponseSchema, tenantListResponseSchema };
