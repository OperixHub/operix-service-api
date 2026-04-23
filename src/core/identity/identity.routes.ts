import { Router } from 'express';
import RolesMiddleware from '../middlewares/roles.middleware.js';
import UsersController from './users/users.controller.js';
import TenantsController from './tenants/tenants.controller.js';
import ValidateMiddleware from '../middlewares/validate.middleware.js';
import { tenantCreateSchema } from './tenants/tenants.schema.js';

const router = Router();
router.use(RolesMiddleware.requireRole('module:organization'));

// Users
router.get('/users', UsersController.getAll);
router.delete('/users/:id', UsersController.remove);

// Tenants
router.get('/tenants', TenantsController.getAll);
router.post('/tenants', ValidateMiddleware.validateSchema(tenantCreateSchema), TenantsController.create);
router.delete('/tenants/:id', TenantsController.remove);

export default router;
