import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.js';
import { z } from '../../../core/schemas/zod-openapi.js';

const stockSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  quantity: z.number().int(),
  purchasePrice: z.number(),
  salePrice: z.number(),
}).openapi('Stock');

const stockCreateSchema = stockSchema.omit({
  id: true,
}).extend({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
  code: z.string().min(1, 'Campo "Código" é obrigatório.'),
}).openapi('StockCreate');

const stockResponseSchema = buildApiResponseSchema(stockSchema, 'StockResponse');
const stockListResponseSchema = buildApiListResponseSchema(stockSchema, 'StockListResponse');

export { stockSchema, stockCreateSchema, stockResponseSchema, stockListResponseSchema };
