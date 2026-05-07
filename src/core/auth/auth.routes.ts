import { Router } from 'express';
import AuthController from './auth.controller.js';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import {
  authAuthorizeSchema,
  authCallbackSchema,
  authLoginSchema,
  authRefreshSchema,
  onboardingSchema,
} from './auth.schema.js';

const router = Router();

router.get('/config', AuthController.config);
router.post('/authorize', ValidateMiddleware.validateSchema(authAuthorizeSchema), AuthController.authorize);
router.post('/callback', ValidateMiddleware.validateSchema(authCallbackSchema), AuthController.callback);
router.post('/login', ValidateMiddleware.validateSchema(authLoginSchema), AuthController.login);
router.post('/refresh', ValidateMiddleware.validateSchema(authRefreshSchema), AuthController.refreshToken);
router.get('/me', AuthMiddleware.authToken, AuthController.me);
router.post(
  '/onboarding',
  AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(onboardingSchema),
  AuthController.completeOnboarding,
);

export default router;
