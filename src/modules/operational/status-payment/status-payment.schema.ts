import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const statusPaymentSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable(),
  description: z.string().min(1),
  cod: z.number().nullable(),
  color: z.string(),
}).openapi('StatusPayment');

const statusPaymentCreateSchema = z.object({
  cod: z.number().nullable(),
  description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
  color: z.string(),
}).openapi('StatusPaymentCreate');

const statusPaymentResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: statusPaymentSchema,
}).openapi('StatusPaymentResponse');

const statusPaymentListResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.array(statusPaymentSchema),
}).openapi('StatusPaymentListResponse');

export {
  statusPaymentSchema,
  statusPaymentCreateSchema,
  statusPaymentResponseSchema,
  statusPaymentListResponseSchema,
};
