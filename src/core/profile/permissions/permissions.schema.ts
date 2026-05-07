import { buildApiResponseSchema } from '../../schemas/api-response.schema.js';
import { z } from '../../schemas/zod-openapi.js';
import { userPublicSchema } from '../users/users.schema.js';
import { manageableModuleKeys } from './permissions.catalog.js';

const manageableModuleKeySchema = z.enum(manageableModuleKeys);
const permissionEffectSchema = z.enum(['allow', 'deny']);
const permissionSourceSchema = z.enum(['authenticated', 'role', 'override:allow', 'override:deny', 'deployment:local', 'plan', 'none']);

const permissionCatalogItemSchema = z.object({
  key: z.string(),
  module_key: z.string(),
  module_label: z.string(),
  module_description: z.string(),
  role_key: z.string().nullable(),
  label: z.string(),
  description: z.string(),
  route: z.string().nullable(),
}).openapi('PermissionCatalogItem');

const permissionModuleSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
  role_key: z.string().nullable(),
  permissions: z.array(permissionCatalogItemSchema),
}).openapi('PermissionModule');

const permissionDecisionSchema = permissionCatalogItemSchema.extend({
  allowed: z.boolean(),
  source: permissionSourceSchema,
}).openapi('PermissionDecision');

const permissionOverrideSchema = z.object({
  permission_key: z.string(),
  effect: permissionEffectSchema,
}).openapi('PermissionOverride');

const permissionOverridesUpdateSchema = z.object({
  overrides: z.array(permissionOverrideSchema).superRefine((overrides, ctx) => {
    const uniqueKeys = new Set<string>();

    overrides.forEach((override, index) => {
      if (uniqueKeys.has(override.permission_key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'permission_key duplicado.',
          path: [index, 'permission_key'],
        });
        return;
      }

      uniqueKeys.add(override.permission_key);
    });
  }),
}).openapi('PermissionOverridesUpdate');

const permissionsCatalogResponseSchema = buildApiResponseSchema(
  z.object({
    modules: z.array(permissionModuleSchema),
    permissions: z.array(permissionCatalogItemSchema),
    plans: z.array(z.any()),
  }),
  'PermissionsCatalogResponse',
);

const permissionsMeResponseSchema = buildApiResponseSchema(
  z.object({
    roles: z.array(z.string()),
    effective_permissions: z.array(z.string()),
    permissions: z.array(permissionDecisionSchema),
    access: z.any().optional(),
  }),
  'PermissionsMeResponse',
);

const permissionsUserResponseSchema = buildApiResponseSchema(
  z.object({
    user: userPublicSchema,
    roles: z.array(z.string()),
    module_roles: z.array(z.string()),
    overrides: z.array(permissionOverrideSchema),
    effective_permissions: z.array(z.string()),
    permissions: z.array(permissionDecisionSchema),
    access: z.any().optional(),
  }),
  'PermissionsUserResponse',
);

export {
  manageableModuleKeySchema,
  permissionCatalogItemSchema,
  permissionDecisionSchema,
  permissionEffectSchema,
  permissionModuleSchema,
  permissionOverrideSchema,
  permissionOverridesUpdateSchema,
  permissionsCatalogResponseSchema,
  permissionsMeResponseSchema,
  permissionsUserResponseSchema,
};
