import { buildApiResponseSchema } from '../schemas/api-response.schema.js';
import { z } from '../schemas/zod-openapi.js';
import {
  permissionDecisionSchema,
  permissionsCatalogDataSchema,
} from './permissions/permissions.schema.js';
import { tenantSchema } from './tenants/tenants.schema.js';
import { sanitizedUserSchema } from './users/users.schema.js';

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

const profileMeResponseSchema = buildApiResponseSchema(sanitizedUserSchema, 'ProfileMeResponse');
const companySettingsResponseSchema = buildApiResponseSchema(tenantSchema.nullable(), 'CompanySettingsResponse');
const profileSystemResponseSchema = buildApiResponseSchema(z.object({
  access: z.any().optional(),
  effective_permissions: z.array(z.string()),
  permissions: z.array(permissionDecisionSchema),
  catalog: permissionsCatalogDataSchema,
}), 'ProfileSystemResponse');

export {
  companySettingsResponseSchema,
  companySettingsUpdateSchema,
  profileMeResponseSchema,
  profileSystemResponseSchema,
  userProfileUpdateSchema,
};
