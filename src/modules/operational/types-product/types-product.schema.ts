import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const typeProductSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  name: z.string().min(1),
}).openapi('TypeProduct');

const typeProductCreateSchema = z.object({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
}).openapi('TypeProductCreate');

const typeProductResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: typeProductSchema,
}).openapi('TypeProductResponse');

const typeProductListResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.array(typeProductSchema),
}).openapi('TypeProductListResponse');

export {
  typeProductSchema,
  typeProductCreateSchema,
  typeProductResponseSchema,
  typeProductListResponseSchema,
};
