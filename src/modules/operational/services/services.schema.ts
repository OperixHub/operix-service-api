import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const serviceSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  product: z.string().min(1),
  client: z.string().min(1),
  telephone: z.string().min(1),
  adress: z.string().optional(),
  status: z.union([z.string(), z.number()]).optional(),
  payment_status: z.number().optional(),
  order_of_service: z.number().nullable().optional(),
  observation: z.string().optional(),
  warehouse_status: z.boolean().optional(),
  created_at: z.string().nullable().optional(),
  updated_at_service: z.string().nullable().optional(),
  updated_at_payment: z.string().nullable().optional(),
  created_at_warehouse: z.string().nullable().optional(),
}).openapi('Service');

const serviceCreateSchema = z.object({
  product: z.string().min(1, 'Campo "Produto" é obrigatório.'),
  client: z.string().min(1, 'Campo "Cliente" é obrigatório.'),
  telephone: z.string().min(1, 'Campo "Telefone" é obrigatório.'),
  status: z.union([z.string(), z.number()]).refine((val) => val !== '', { message: 'Campo "Status" é obrigatório.' }),
}).openapi('ServiceCreate');

const serviceUpdateInfoClientSchema = z.object({
  product: z.string().min(1),
  client: z.string().min(1),
  telephone: z.string().min(1),
  adress: z.string().optional(),
  observation: z.string().optional(),
}).openapi('ServiceUpdateInfoClient');

const serviceResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: serviceSchema,
}).openapi('ServiceResponse');

const serviceListResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  data: z.array(serviceSchema),
}).openapi('ServiceListResponse');

export {
  serviceSchema,
  serviceCreateSchema,
  serviceUpdateInfoClientSchema,
  serviceResponseSchema,
  serviceListResponseSchema,
};
