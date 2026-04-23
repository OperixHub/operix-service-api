import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.js';
import { z } from '../../../core/schemas/zod-openapi.js';

const statusServiceSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  description: z.string().min(1),
  cod: z.number().nullable().optional(),
  color: z.string().optional(),
}).openapi('StatusService');

const statusServiceCreateSchema = statusServiceSchema.omit({
  id: true,
  tenant_id: true,
}).extend({
  description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
}).openapi('StatusServiceCreate');

const statusServiceResponseSchema = buildApiResponseSchema(statusServiceSchema, 'StatusServiceResponse');
const statusServiceListResponseSchema = buildApiListResponseSchema(statusServiceSchema, 'StatusServiceListResponse');

export {
  statusServiceSchema,
  statusServiceCreateSchema,
  statusServiceResponseSchema,
  statusServiceListResponseSchema,
};
