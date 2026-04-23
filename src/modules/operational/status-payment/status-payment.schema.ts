import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.js';
import { z } from '../../../core/schemas/zod-openapi.js';

const statusPaymentSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable(),
  description: z.string().min(1),
  cod: z.number().nullable(),
  color: z.string(),
}).openapi('StatusPayment');

const statusPaymentCreateSchema = statusPaymentSchema.omit({
  id: true,
  tenant_id: true,
}).extend({
  description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
}).openapi('StatusPaymentCreate');

const statusPaymentResponseSchema = buildApiResponseSchema(statusPaymentSchema, 'StatusPaymentResponse');
const statusPaymentListResponseSchema = buildApiListResponseSchema(statusPaymentSchema, 'StatusPaymentListResponse');

export {
  statusPaymentSchema,
  statusPaymentCreateSchema,
  statusPaymentResponseSchema,
  statusPaymentListResponseSchema,
};
