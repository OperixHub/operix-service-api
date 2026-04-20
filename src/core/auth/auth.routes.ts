import { Router } from 'express';
import AuthController from './auth.controller.js';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';
import AuthModel from './auth.model.js';

const router = Router();

router.post('/login', ValidateMiddleware.validateSchema(AuthModel.loginSchema), AuthController.login);
router.post('/register', ValidateMiddleware.validateSchema(AuthModel.registerSchema), AuthController.register);
router.post('/refresh', ValidateMiddleware.validateSchema(AuthModel.refreshSchema), AuthController.refreshToken);

export default router;
