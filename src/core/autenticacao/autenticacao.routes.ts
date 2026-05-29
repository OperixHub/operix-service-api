import { Router } from 'express';
import AutenticacaoController from './autenticacao.controller.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import AutenticacaoMiddleware from '../middlewares/autenticacao.middleware.js';
import {
  authAuthorizeSchema,
  authCallbackSchema,
  authLoginSchema,
  authRefreshSchema,
  onboardingSchema,
} from './autenticacao.schema.js';

const router = Router();

router.get('/configuracao', AutenticacaoController.config);
router.post('/autorizar', ValidacaoMiddleware.validarSchema(authAuthorizeSchema), AutenticacaoController.authorize);
router.post('/retorno', ValidacaoMiddleware.validarSchema(authCallbackSchema), AutenticacaoController.callback);
router.post('/login', ValidacaoMiddleware.validarSchema(authLoginSchema), AutenticacaoController.login);
router.post('/renovar', ValidacaoMiddleware.validarSchema(authRefreshSchema), AutenticacaoController.renovarToken);
router.post('/sair', ValidacaoMiddleware.validarSchema(authRefreshSchema), AutenticacaoController.logout);
router.get('/eu', AutenticacaoMiddleware.autenticarToken, AutenticacaoController.me);
router.post(
  '/onboarding',
  AutenticacaoMiddleware.autenticarToken,
  ValidacaoMiddleware.validarSchema(onboardingSchema),
  AutenticacaoController.concluirOnboarding,
);

export default router;
