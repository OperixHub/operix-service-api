import { Router } from 'express';
import UsersController from './users/users.controller.js';
import TenantsController from './tenants/tenants.controller.js';
import ValidateMiddleware from '../middlewares/validate.middleware.js';
import { tenantCreateSchema } from './tenants/tenants.schema.js';
import { userCreateSchema } from './users/users.schema.js';
import PermissionsMiddleware from '../permissions/permissions.middleware.js';

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

export default router;
