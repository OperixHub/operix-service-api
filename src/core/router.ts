import { Router, json } from 'express';
import { serve, setup } from 'swagger-ui-express';
import { generateOpenApiDocument } from './docs/openapi.js';

import AuthMiddleware from './middlewares/auth.middleware.js';
import { operationalRouter } from '../modules/operational/index.js';
import { inventoryRouter } from '../modules/inventory/index.js';
import { organizationRouter } from '../modules/organization/index.js';
import { notificationsRouter } from '../modules/notifications/index.js';
import authRouter from './auth/auth.routes.js';
// Opcional: Logs controller se houver rotas para logs (adicionar depois se precisar ou já deixar provisionado)
// import LogsController from './logs/logs.controller.js';

const router = Router();
const openApiDocument = generateOpenApiDocument();

router.use(json());

// Swagger Docs (Não protegido por auth, se desejar. Mas atualmente estava na raiz)
router.use('/docs', serve);
router.get('/docs', setup(openApiDocument));



// Rotas públicas de Autenticação/Proxy para o Keycloak
router.use('/api/auth', authRouter);

// Middleware Global de Auth do Keycloak
router.use(AuthMiddleware.authToken);

// Rotas Modulares
// prefixos baseados no dominio
router.use('/api', operationalRouter);
router.use('/api', inventoryRouter);
router.use('/api', organizationRouter);
router.use('/api', notificationsRouter);

export default router;
