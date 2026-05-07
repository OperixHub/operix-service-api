import { Router } from 'express';
import UsersController from './users/users.controller.js';
import TenantsController from './tenants/tenants.controller.js';
import ValidateMiddleware from '../middlewares/validate.middleware.js';
import { tenantCreateSchema } from './tenants/tenants.schema.js';
import { userAccessUpdateSchema, userCreateSchema } from './users/users.schema.js';
import PermissionsMiddleware from '../middlewares/permissions.middleware.js';
import PermissionsController from './permissions/permissions.controller.js';
import { permissionOverridesUpdateSchema } from './permissions/permissions.schema.js';
import ProfileSettingsController from './profile-settings.controller.js';
import { companySettingsUpdateSchema, userProfileUpdateSchema } from './profile-settings.schema.js';

const router = Router();

// Users
router.get('/users', PermissionsMiddleware.requirePermission('organization.users.access'), UsersController.getAll);
router.post(
  '/users',
  PermissionsMiddleware.requirePermission('organization.users.access'),
  PermissionsMiddleware.requireAdmin(),
  ValidateMiddleware.validateSchema(userCreateSchema),
  UsersController.create,
);
router.delete(
  '/users/:id',
  PermissionsMiddleware.requirePermission('organization.users.access'),
  PermissionsMiddleware.requireAdmin(),
  UsersController.remove,
);
router.patch(
  '/users/:id/access',
  PermissionsMiddleware.requirePermission('organization.users.access'),
  PermissionsMiddleware.requireAdmin(),
  ValidateMiddleware.validateSchema(userAccessUpdateSchema),
  UsersController.updateAccess,
);

// Profile / Settings
router.get('/profile/me', ProfileSettingsController.getMe);
router.patch('/profile/me', ValidateMiddleware.validateSchema(userProfileUpdateSchema), ProfileSettingsController.updateMe);
router.get(
  '/profile/company',
  PermissionsMiddleware.requirePermission('organization.settings.access'),
  PermissionsMiddleware.requireAdmin(),
  ProfileSettingsController.getCompany,
);
router.patch(
  '/profile/company',
  PermissionsMiddleware.requirePermission('organization.settings.access'),
  PermissionsMiddleware.requireAdmin(),
  ValidateMiddleware.validateSchema(companySettingsUpdateSchema),
  ProfileSettingsController.updateCompany,
);
router.get('/profile/system', ProfileSettingsController.getSystem);

// Tenants
router.get('/tenants', PermissionsMiddleware.requirePermission('organization.tenants.access'), TenantsController.getAll);
router.post(
  '/tenants',
  PermissionsMiddleware.requirePermission('organization.tenants.access'),
  PermissionsMiddleware.requireAdmin(),
  ValidateMiddleware.validateSchema(tenantCreateSchema),
  TenantsController.create,
);
router.delete(
  '/tenants/:id',
  PermissionsMiddleware.requirePermission('organization.tenants.access'),
  PermissionsMiddleware.requireAdmin(),
  TenantsController.remove,
);

//Permissions
router.get('/permissions/me', PermissionsController.getMe);
router.get(
  '/permissions/catalog',
  PermissionsMiddleware.requirePermission('organization.users.access'),
  PermissionsMiddleware.requireAdmin(),
  PermissionsController.getCatalog,
);
router.get(
  '/permissions/users/:id',
  PermissionsMiddleware.requirePermission('organization.users.access'),
  PermissionsMiddleware.requireAdmin(),
  PermissionsController.getUser,
);
router.put(
  '/permissions/users/:id',
  PermissionsMiddleware.requirePermission('organization.users.access'),
  PermissionsMiddleware.requireAdmin(),
  ValidateMiddleware.validateSchema(permissionOverridesUpdateSchema),
  PermissionsController.replaceUserOverrides,
);


export default router;
