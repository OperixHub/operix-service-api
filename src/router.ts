import { Router, json } from 'express';
import { serve, setup } from 'swagger-ui-express';
import { generateOpenApiDocument } from "./docs/openapi";

import AuthController from './controllers/AuthController';
import UsersController from './controllers/UsersController';
import ServicesController from './controllers/ServicesController.js';
import OrderOfServiceController from './controllers/OrderOfServiceController.js';
import StatusPaymentController from './controllers/StatusPaymentController.js';
import StatusServiceController from './controllers/StatusServiceController.js';
import TypesProductController from './controllers/TypesProductController.js';
import PanelAnalyticalController from './controllers/PanelAnalyticalController.js';
import ToolsController from './controllers/ToolsController.js';
import ExpensesController from './controllers/ExpensesController.js';
import TenantsController from './controllers/TenantsController';

import AuthMiddleware from './middlewares/AuthMiddleware';
import ServicesMiddleware from './middlewares/ServicesMiddleware';
import OrderOfServiceMiddleware from './middlewares/OrderOfServiceMiddleware';
import StatusPaymentMiddleware from './middlewares/StatusPaymentMiddleware';
import StatusServiceMiddleware from './middlewares/StatusServiceMiddleware';
import TypesProductMiddleware from './middlewares/TypesProductMiddleware';
import ExpensesMiddleware from './middlewares/ExpensesMiddleware';
import TenantsMiddleware from './middlewares/TenantsMiddleware';

import ValidateMiddleware from "./middlewares/ValidateMiddleware";

const router = Router();
const openApiDocument = generateOpenApiDocument();

router.use(json());
router.use('/', serve);
router.get('/', setup(openApiDocument));

router.post(
  '/auth/register',
  ValidateMiddleware.validateSchema(AuthMiddleware.registerSchema),
  AuthController.register
);

router.post(
  '/auth/login',
  ValidateMiddleware.validateSchema(AuthMiddleware.loginSchema),
  AuthController.login
);

router.get(
  '/users', AuthMiddleware.authToken,
  UsersController.getAll
);

router.get(
  '/users/signature/:id',
  AuthMiddleware.authToken,
  UsersController.getSignature
);

router.delete(
  '/users/:id', AuthMiddleware.authToken,
  UsersController.remove
);

router.get('/tenants', AuthMiddleware.authToken,
  TenantsController.getAll
);

router.post('/tenants', AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(TenantsMiddleware.createSchema),
  TenantsController.create
);

router.delete('/tenants/:id', AuthMiddleware.authToken,
  TenantsController.remove
);

router.get(
  '/expenses', AuthMiddleware.authToken,
  ExpensesController.getAll
);

router.post(
  '/expenses', AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(ExpensesMiddleware.createSchema),
  ExpensesController.create
);

router.delete(
  '/expenses/:id', AuthMiddleware.authToken,
  ExpensesController.remove
);

router.get(
  '/services', AuthMiddleware.authToken,
  ServicesController.getAll
);

router.get(
  '/services/warehouse',
  AuthMiddleware.authToken,
  ServicesController.getAllWharehouse
);

router.post(
  '/services',
  AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(ServicesMiddleware.createSchema),
  ServicesController.create
);

router.put(
  '/services/warehouse/:id/:value',
  AuthMiddleware.authToken,
  ServicesController.updateWarehouse
);

router.put(
  '/services/info/client/:id',
  AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(ServicesMiddleware.updateInfoClientSchema),
  ServicesController.updateInfoClient
);

router.put(
  '/services/status/:id/:status',
  AuthMiddleware.authToken,
  ServicesController.updateStatusService
);

router.put(
  '/services/status/payment/:id/:status',
  AuthMiddleware.authToken,
  ServicesController.updateStatusPayment
);

router.delete(
  '/services/:id/:cod/:typeTable',
  AuthMiddleware.authToken,
  ServicesController.remove
);

router.get(
  '/order_of_service/',
  AuthMiddleware.authToken,
  OrderOfServiceController.getAll
);

router.get(
  '/order_of_service/:cod',
  AuthMiddleware.authToken,
  OrderOfServiceController.getUnique
);

router.put(
  '/order_of_service/estimate/:cod',
  AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(OrderOfServiceMiddleware.updateEstimateSchema),
  OrderOfServiceController.updateEstimate
);

router.delete(
  '/order_of_service/estimate/:cod/:idEstimate',
  AuthMiddleware.authToken,
  OrderOfServiceController.removeEstimate
);

router.get(
  '/status_payment',
  AuthMiddleware.authToken,
  StatusPaymentController.getAll
);

router.post(
  '/status_payment',
  AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(StatusPaymentMiddleware.createSchema),
  StatusPaymentController.create
);

router.delete(
  '/status_payment/:id',
  AuthMiddleware.authToken,
  StatusPaymentController.remove
);

router.get(
  '/status_service',
  AuthMiddleware.authToken,
  StatusServiceController.getAll
);

router.post(
  '/status_service',
  AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(StatusServiceMiddleware.createSchema),
  StatusServiceController.create
);

router.delete(
  '/status_service/:id',
  AuthMiddleware.authToken,
  StatusServiceController.remove
);

router.get(
  '/types_product',
  AuthMiddleware.authToken,
  TypesProductController.getAll
);

router.post(
  '/types_product',
  AuthMiddleware.authToken,
  ValidateMiddleware.validateSchema(TypesProductMiddleware.createSchema),
  TypesProductController.create
);

router.delete(
  '/types_product/:id',
  AuthMiddleware.authToken,
  TypesProductController.remove
);

router.get(
  '/panel_analytical/info_values_os_paid',
  AuthMiddleware.authToken,
  PanelAnalyticalController.getSumValuesOrdersPaid
);

router.get(
  '/panel_analytical/info_invoicing_liquid',
  AuthMiddleware.authToken,
  PanelAnalyticalController.getValuesInvoicingLiquid
);


router.get(
  '/tools/notifications',
  AuthMiddleware.authToken,
  ToolsController.getNotifications
);

export default router;
