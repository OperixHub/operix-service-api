import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const stockSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  quantity: z.number().int(),
  purchasePrice: z.number(),
  salePrice: z.number(),
}).openapi('Stock');

const stockCreateSchema = z.object({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
  code: z.string().min(1, 'Campo "Código" é obrigatório.'),
  description: z.string().nullable().optional(),
  quantity: z.number().int(),
  purchasePrice: z.number(),
  salePrice: z.number(),
}).openapi('StockCreate');

const stockResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: stockSchema,
}).openapi('StockResponse');

const stockListResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.array(stockSchema),
}).openapi('StockListResponse');

export { stockSchema, stockCreateSchema, stockResponseSchema, stockListResponseSchema };
