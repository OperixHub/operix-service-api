import { buildApiListResponseSchema, buildApiResponseSchema } from '../../schemas/api-response.schema.js';
import { z } from '../../schemas/zod-openapi.js';

const tenantSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(1),
  keycloak_group_id: z.string().nullable().optional(),
}).openapi('Tenant');

const tenantCreateSchema = tenantSchema.omit({
  id: true,
  keycloak_group_id: true,
}).extend({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
}).openapi('TenantCreate');

const tenantResponseSchema = buildApiResponseSchema(tenantSchema, 'TenantResponse');
const tenantListResponseSchema = buildApiListResponseSchema(tenantSchema, 'TenantListResponse');

export { tenantSchema, tenantCreateSchema, tenantResponseSchema, tenantListResponseSchema };
