import { Router } from 'express';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';
import PermissionsMiddleware from '../../core/middlewares/permissions.middleware.js';

import ServicesController from './services/services.controller.js';
import { serviceCreateSchema, serviceUpdateInfoClientSchema } from './services/services.schema.js';

import OrderOfServiceController from './order-of-service/order-of-service.controller.js';
import { orderUpdateEstimateSchema } from './order-of-service/order-of-service.schema.js';

import StatusServiceController from './status-service/status-service.controller.js';
import { statusServiceCreateSchema } from './status-service/status-service.schema.js';

import StatusPaymentController from './status-payment/status-payment.controller.js';
import { statusPaymentCreateSchema } from './status-payment/status-payment.schema.js';

import TypesProductController from './types-product/types-product.controller.js';
import { typeProductCreateSchema } from './types-product/types-product.schema.js';

const router = Router();

// --- Services ---
router.get('/services', PermissionsMiddleware.requirePermission('operational.services.access'), ServicesController.getAll);
router.get('/services/warehouse', PermissionsMiddleware.requirePermission('operational.services.access'), ServicesController.getAllWharehouse);
router.post(
  '/services',
  PermissionsMiddleware.requirePermission('operational.services.access'),
  ValidateMiddleware.validateSchema(serviceCreateSchema),
  ServicesController.create,
);
router.put('/services/warehouse/:id/:value', PermissionsMiddleware.requirePermission('operational.services.access'), ServicesController.updateWarehouse);
router.put(
  '/services/info/client/:id',
  PermissionsMiddleware.requirePermission('operational.services.access'),
  ValidateMiddleware.validateSchema(serviceUpdateInfoClientSchema),
  ServicesController.updateInfoClient,
);
router.put('/services/status/:id/:status', PermissionsMiddleware.requirePermission('operational.services.access'), ServicesController.updateStatusService);
router.put('/services/status/payment/:id/:status', PermissionsMiddleware.requirePermission('operational.services.access'), ServicesController.updateStatusPayment);
router.delete('/services/:id/:cod/:typeTable', PermissionsMiddleware.requirePermission('operational.services.access'), ServicesController.remove);

// --- Order of Service ---
router.get('/order-of-service', PermissionsMiddleware.requirePermission('operational.services.access'), OrderOfServiceController.getAll);
router.get('/order-of-service/:cod', PermissionsMiddleware.requirePermission('operational.services.access'), OrderOfServiceController.getUnique);
router.put(
  '/order-of-service/estimate/:cod',
  PermissionsMiddleware.requirePermission('operational.services.access'),
  ValidateMiddleware.validateSchema(orderUpdateEstimateSchema),
  OrderOfServiceController.updateEstimate,
);
router.delete('/order-of-service/estimate/:cod/:idEstimate', PermissionsMiddleware.requirePermission('operational.services.access'), OrderOfServiceController.removeEstimate);

// --- Status Service ---
router.get('/status-service', PermissionsMiddleware.requirePermission('operational.status.access'), StatusServiceController.getAll);
router.post(
  '/status-service',
  PermissionsMiddleware.requirePermission('operational.status.access'),
  ValidateMiddleware.validateSchema(statusServiceCreateSchema),
  StatusServiceController.create,
);
router.delete('/status-service/:id', PermissionsMiddleware.requirePermission('operational.status.access'), StatusServiceController.remove);

// --- Status Payment ---
router.get('/status-payment', PermissionsMiddleware.requirePermission('operational.status.access'), StatusPaymentController.getAll);
router.post(
  '/status-payment',
  PermissionsMiddleware.requirePermission('operational.status.access'),
  ValidateMiddleware.validateSchema(statusPaymentCreateSchema),
  StatusPaymentController.create,
);
router.delete('/status-payment/:id', PermissionsMiddleware.requirePermission('operational.status.access'), StatusPaymentController.remove);

// --- Types Product ---
router.get('/types-product', PermissionsMiddleware.requirePermission('operational.types-products.access'), TypesProductController.getAll);
router.post(
  '/types-product',
  PermissionsMiddleware.requirePermission('operational.types-products.access'),
  ValidateMiddleware.validateSchema(typeProductCreateSchema),
  TypesProductController.create,
);
router.delete('/types-product/:id', PermissionsMiddleware.requirePermission('operational.types-products.access'), TypesProductController.remove);

export default router;
