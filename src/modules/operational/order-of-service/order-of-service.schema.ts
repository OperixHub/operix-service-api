import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.js';
import { z } from '../../../core/schemas/zod-openapi.js';

const orderOfServiceSchema = z.object({
  cod_order: z.union([z.string(), z.number()]).nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  estimate: z.string().nullable().optional(),
  value: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
}).openapi('OrderOfService');

const orderOfServiceCreateSchema = orderOfServiceSchema.pick({
  estimate: true,
  value: true,
}).extend({
  value: z.number(),
}).openapi('OrderOfServiceCreate');

const orderUpdateEstimateSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  price: z.union([z.string(), z.number()]).refine((val) => val !== ''),
  amount: z.union([z.string(), z.number()]).optional(),
}).superRefine((data, ctx) => {
  if (data.type !== 'simples' && (data.amount === undefined || data.amount === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo "Quantidade" é obrigatório.', path: ['amount'] });
  }
}).openapi('OrderUpdateEstimate');

const orderOfServiceResponseSchema = buildApiResponseSchema(orderOfServiceSchema, 'OrderOfServiceResponse');
const orderOfServiceListResponseSchema = buildApiListResponseSchema(orderOfServiceSchema, 'OrderOfServiceListResponse');

export {
  orderOfServiceSchema,
  orderOfServiceCreateSchema,
  orderUpdateEstimateSchema,
  orderOfServiceResponseSchema,
  orderOfServiceListResponseSchema,
};
