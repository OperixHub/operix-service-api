import { Router } from 'express';
import SystemInfoController from './system-info/system-info.controller.js';
import PermissionsMiddleware from '../../core/middlewares/permissions.middleware.js';

const router = Router();

router.get('/system-info', PermissionsMiddleware.requirePermission('notifications.system-info.access'), SystemInfoController.getSystemInfo);

export default router;
