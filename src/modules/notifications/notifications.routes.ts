import { Router } from 'express';
import RolesMiddleware from '../../core/middlewares/roles.middleware.js';
import ToolsController from './tools/tools.controller.js';

const router = Router();
router.use(RolesMiddleware.requireRole('module:notifications'));

router.get('/notifications', ToolsController.getNotifications);

export default router;
