import { Router } from 'express';
import RolesMiddleware from '../../core/middlewares/roles.middleware.js';
import SystemInfoController from './system-info/system-info.controller.js';

const router = Router();
router.use(RolesMiddleware.requireRole('module:notifications'));

router.get('/system-info', SystemInfoController.getSystemInfo);

export default router;
