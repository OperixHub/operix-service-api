import { Router } from 'express';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import EstoqueController from './estoque/estoque.controller.js';
import { stockCreateSchema } from './estoque/estoque.schema.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';

const router = Router();

router.get('/estoque', PermissoesMiddleware.exigirPermissao('inventory.stock.access'), EstoqueController.obterTodos);
router.post(
  '/estoque',
  PermissoesMiddleware.exigirPermissao('inventory.stock.access'),
  ValidacaoMiddleware.validarSchema(stockCreateSchema),
  EstoqueController.criar,
);
router.put('/estoque/:id', PermissoesMiddleware.exigirPermissao('inventory.stock.access'), EstoqueController.atualizar);
router.delete('/estoque/:id', PermissoesMiddleware.exigirPermissao('inventory.stock.access'), EstoqueController.remover);

export default router;
