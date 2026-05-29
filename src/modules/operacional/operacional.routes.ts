import { Router } from 'express';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';

import ServicosController from './servicos/servicos.controller.js';
import { serviceCreateSchema, serviceUpdateInfoClientSchema } from './servicos/servicos.schema.js';

import OrdemServicoController from './ordem-servico/ordem-servico.controller.js';
import { orderUpdateEstimateSchema } from './ordem-servico/ordem-servico.schema.js';

import StatusServicoController from './status-servico/status-servico.controller.js';
import { statusServiceCreateSchema } from './status-servico/status-servico.schema.js';

import StatusPagamentoController from './status-pagamento/status-pagamento.controller.js';
import { statusPaymentCreateSchema } from './status-pagamento/status-pagamento.schema.js';

import TiposProdutoController from './tipos-produto/tipos-produto.controller.js';
import { typeProductCreateSchema } from './tipos-produto/tipos-produto.schema.js';

const router = Router();

// --- Services ---
router.get('/servicos', PermissoesMiddleware.exigirPermissao('operational.services.access'), ServicosController.obterTodos);
router.get('/servicos/almoxarifado', PermissoesMiddleware.exigirPermissao('operational.services.access'), ServicosController.obterTodosAlmoxarifado);
router.post(
  '/servicos',
  PermissoesMiddleware.exigirPermissao('operational.services.access'),
  ValidacaoMiddleware.validarSchema(serviceCreateSchema),
  ServicosController.criar,
);
router.put('/servicos/almoxarifado/:id/:value', PermissoesMiddleware.exigirPermissao('operational.services.access'), ServicosController.atualizarAlmoxarifado);
router.put(
  '/servicos/info/cliente/:id',
  PermissoesMiddleware.exigirPermissao('operational.services.access'),
  ValidacaoMiddleware.validarSchema(serviceUpdateInfoClientSchema),
  ServicosController.atualizarInfoCliente,
);
router.put('/servicos/status/:id/:status', PermissoesMiddleware.exigirPermissao('operational.services.access'), ServicosController.atualizarStatusServico);
router.put('/servicos/status/pagamento/:id/:status', PermissoesMiddleware.exigirPermissao('operational.services.access'), ServicosController.atualizarStatusPagamento);
router.delete('/servicos/:id/:cod/:typeTable', PermissoesMiddleware.exigirPermissao('operational.services.access'), ServicosController.remover);

// --- Order of Service ---
router.get('/ordem-servico', PermissoesMiddleware.exigirPermissao('operational.services.access'), OrdemServicoController.obterTodos);
router.get('/ordem-servico/:cod', PermissoesMiddleware.exigirPermissao('operational.services.access'), OrdemServicoController.obterUnico);
router.put(
  '/ordem-servico/orcamento/:cod',
  PermissoesMiddleware.exigirPermissao('operational.services.access'),
  ValidacaoMiddleware.validarSchema(orderUpdateEstimateSchema),
  OrdemServicoController.atualizarOrcamento,
);
router.delete('/ordem-servico/orcamento/:cod/:idEstimate', PermissoesMiddleware.exigirPermissao('operational.services.access'), OrdemServicoController.removerOrcamento);

// --- Status Service ---
router.get('/status-servico', PermissoesMiddleware.exigirPermissao('operational.status.access'), StatusServicoController.obterTodos);
router.post(
  '/status-servico',
  PermissoesMiddleware.exigirPermissao('operational.status.access'),
  ValidacaoMiddleware.validarSchema(statusServiceCreateSchema),
  StatusServicoController.criar,
);
router.delete('/status-servico/:id', PermissoesMiddleware.exigirPermissao('operational.status.access'), StatusServicoController.remover);

// --- Status Payment ---
router.get('/status-pagamento', PermissoesMiddleware.exigirPermissao('operational.status.access'), StatusPagamentoController.obterTodos);
router.post(
  '/status-pagamento',
  PermissoesMiddleware.exigirPermissao('operational.status.access'),
  ValidacaoMiddleware.validarSchema(statusPaymentCreateSchema),
  StatusPagamentoController.criar,
);
router.delete('/status-pagamento/:id', PermissoesMiddleware.exigirPermissao('operational.status.access'), StatusPagamentoController.remover);

// --- Types Product ---
router.get('/tipos-produto', PermissoesMiddleware.exigirPermissao('operational.types-products.access'), TiposProdutoController.obterTodos);
router.post(
  '/tipos-produto',
  PermissoesMiddleware.exigirPermissao('operational.types-products.access'),
  ValidacaoMiddleware.validarSchema(typeProductCreateSchema),
  TiposProdutoController.criar,
);
router.delete('/tipos-produto/:id', PermissoesMiddleware.exigirPermissao('operational.types-products.access'), TiposProdutoController.remover);

export default router;
