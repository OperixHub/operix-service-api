import { z } from './zod-openapi.js';

function buildApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T, openApiName: string) {
  return z.object({
    success: z.boolean(),
    msg: z.string(),
    message: z.string(),
    data: dataSchema,
  }).openapi(openApiName);
}

function buildApiListResponseSchema<T extends z.ZodTypeAny>(itemSchema: T, openApiName: string) {
  return z.object({
    success: z.boolean(),
    msg: z.string(),
    message: z.string(),
    data: z.array(itemSchema),
  }).openapi(openApiName);
}

export { buildApiResponseSchema, buildApiListResponseSchema };
