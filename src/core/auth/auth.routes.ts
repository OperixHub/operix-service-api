import { Router } from 'express';
import AuthController from './auth.controller.js';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';
import { authLoginSchema, authRefreshSchema, authRegisterSchema } from './auth.schema.js';

const router = Router();

router.post('/login', ValidateMiddleware.validateSchema(authLoginSchema), AuthController.login);
router.post('/register', ValidateMiddleware.validateSchema(authRegisterSchema), AuthController.register);
router.post('/refresh', ValidateMiddleware.validateSchema(authRefreshSchema), AuthController.refreshToken);

export default router;
