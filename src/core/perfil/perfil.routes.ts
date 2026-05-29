import { Router } from 'express';
import UsuariosController from './usuarios/usuarios.controller.js';
import LocatariosController from './locatarios/locatarios.controller.js';
import ValidacaoMiddleware from '../middlewares/validacao.middleware.js';
import { tenantCreateSchema } from './locatarios/locatarios.schema.js';
import { userAccessUpdateSchema, userCreateSchema } from './usuarios/usuarios.schema.js';
import PermissoesMiddleware from '../middlewares/permissoes.middleware.js';
import PermissoesController from './permissoes/permissoes.controller.js';
import { permissionOverridesUpdateSchema } from './permissoes/permissoes.schema.js';
import ConfiguracoesPerfilController from './configuracoes-perfil.controller.js';
import { companySettingsUpdateSchema, userProfileUpdateSchema } from './configuracoes-perfil.schema.js';

const router = Router();

// Users
router.get('/usuarios', PermissoesMiddleware.exigirPermissao('organization.users.access'), UsuariosController.obterTodos);
router.post(
  '/usuarios',
  PermissoesMiddleware.exigirPermissao('organization.users.access'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(userCreateSchema),
  UsuariosController.criar,
);
router.delete(
  '/usuarios/:id',
  PermissoesMiddleware.exigirPermissao('organization.users.access'),
  PermissoesMiddleware.exigirAdmin(),
  UsuariosController.remover,
);
router.patch(
  '/usuarios/:id/acesso',
  PermissoesMiddleware.exigirPermissao('organization.users.access'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(userAccessUpdateSchema),
  UsuariosController.atualizarAcesso,
);

// Profile / Settings
router.get('/perfil/eu', ConfiguracoesPerfilController.obterMeuPerfil);
router.patch('/perfil/eu', ValidacaoMiddleware.validarSchema(userProfileUpdateSchema), ConfiguracoesPerfilController.atualizarMeuPerfil);
router.get(
  '/perfil/empresa',
  PermissoesMiddleware.exigirPermissao('organization.settings.access'),
  PermissoesMiddleware.exigirAdmin(),
  ConfiguracoesPerfilController.obterEmpresa,
);
router.patch(
  '/perfil/empresa',
  PermissoesMiddleware.exigirPermissao('organization.settings.access'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(companySettingsUpdateSchema),
  ConfiguracoesPerfilController.atualizarEmpresa,
);
router.get('/perfil/sistema', ConfiguracoesPerfilController.obterSistema);

// Tenants
router.get('/locatarios', PermissoesMiddleware.exigirPermissao('organization.tenants.access'), LocatariosController.obterTodos);
router.post(
  '/locatarios',
  PermissoesMiddleware.exigirPermissao('organization.tenants.access'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(tenantCreateSchema),
  LocatariosController.criar,
);
router.delete(
  '/locatarios/:id',
  PermissoesMiddleware.exigirPermissao('organization.tenants.access'),
  PermissoesMiddleware.exigirAdmin(),
  LocatariosController.remover,
);

//Permissaos
router.get('/permissoes/me', PermissoesController.obterMeuPerfil);
router.get(
  '/permissoes/catalogo',
  PermissoesMiddleware.exigirPermissao('organization.users.access'),
  PermissoesMiddleware.exigirAdmin(),
  PermissoesController.obterCatalogo,
);
router.get(
  '/permissoes/usuarios/:id',
  PermissoesMiddleware.exigirPermissao('organization.users.access'),
  PermissoesMiddleware.exigirAdmin(),
  PermissoesController.obterUsuario,
);
router.put(
  '/permissoes/usuarios/:id',
  PermissoesMiddleware.exigirPermissao('organization.users.access'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(permissionOverridesUpdateSchema),
  PermissoesController.substituirSubstituicoesUsuario,
);


export default router;
