import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const statusServiceSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  description: z.string().min(1),
  cod: z.number().nullable().optional(),
  color: z.string().optional(),
}).openapi('StatusService');

const statusServiceCreateSchema = z.object({
  description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
  color: z.string().optional(),
  cod: z.number().nullable().optional(),
}).openapi('StatusServiceCreate');

const statusServiceResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: statusServiceSchema,
}).openapi('StatusServiceResponse');

const statusServiceListResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.array(statusServiceSchema),
}).openapi('StatusServiceListResponse');

export {
  statusServiceSchema,
  statusServiceCreateSchema,
  statusServiceResponseSchema,
  statusServiceListResponseSchema,
};
