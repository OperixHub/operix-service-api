import { Router, json } from 'express';
import { serve, setup } from 'swagger-ui-express';
import { generateOpenApiDocument } from './docs/openapi.js';

import AuthMiddleware from './middlewares/auth.middleware.js';
import { operationalRouter } from '../modules/operational/index.js';
import { inventoryRouter } from '../modules/inventory/index.js';
import { identityRouter } from './identity/index.js';
import { notificationsRouter } from '../modules/notifications/index.js';
import authRouter from './auth/auth.routes.js';
import logsRouter from './logs/logs.routes.js';

const router = Router();
const openApiDocument = generateOpenApiDocument();

router.use(json());

router.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'operix-service-api' }));
router.use('/docs', serve);
router.get('/docs', setup(openApiDocument));

// Rotas públicas de Autenticação/Proxy para o Keycloak
router.use('/api/auth', authRouter);

// Middleware Global de Auth do Keycloak
router.use(AuthMiddleware.authToken);

// Rotas Modulares
router.use('/api', operationalRouter);
router.use('/api', inventoryRouter);
router.use('/api', identityRouter);
router.use('/api', notificationsRouter);
router.use('/api', logsRouter);

export default router;
