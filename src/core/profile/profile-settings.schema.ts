import { z } from '../schemas/zod-openapi.js';

const userProfileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  avatar_url: z.string().optional().nullable(),
  role_title: z.string().optional().nullable(),
  preferences: z.record(z.string(), z.any()).optional(),
}).openapi('UserProfileUpdate');

const companySettingsUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  cnpj: z.string().max(20).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  logo_url: z.string().optional().nullable(),
  enabled_modules: z.array(z.string()).optional(),
}).openapi('CompanySettingsUpdate');

export { companySettingsUpdateSchema, userProfileUpdateSchema };
