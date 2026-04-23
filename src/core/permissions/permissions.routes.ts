import { Router } from 'express';
import ValidateMiddleware from '../middlewares/validate.middleware.js';
import PermissionsController from './permissions.controller.js';
import PermissionsMiddleware from './permissions.middleware.js';
import { permissionOverridesUpdateSchema } from './permissions.schema.js';

const router = Router();

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
