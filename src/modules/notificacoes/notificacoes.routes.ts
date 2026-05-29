import { Router } from 'express';
import InformacoesSistemaController from './informacoes-sistema/informacoes-sistema.controller.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';

const router = Router();

router.get('/informacoes-sistema', PermissoesMiddleware.exigirPermissao('notifications.system-info.access'), InformacoesSistemaController.obterInformacoesSistema);

export default router;
