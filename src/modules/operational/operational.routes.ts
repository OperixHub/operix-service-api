import { Router } from 'express';
import RolesMiddleware from '../../core/middlewares/roles.middleware.js';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';

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

// Toda rota deste módulo exige a role module:operational
router.use(RolesMiddleware.requireRole('module:operational'));

// --- Services ---
router.get('/services', ServicesController.getAll);
router.get('/services/warehouse', ServicesController.getAllWharehouse);
router.post('/services', ValidateMiddleware.validateSchema(serviceCreateSchema), ServicesController.create);
router.put('/services/warehouse/:id/:value', ServicesController.updateWarehouse);
router.put('/services/info/client/:id', ValidateMiddleware.validateSchema(serviceUpdateInfoClientSchema), ServicesController.updateInfoClient);
router.put('/services/status/:id/:status', ServicesController.updateStatusService);
router.put('/services/status/payment/:id/:status', ServicesController.updateStatusPayment);
router.delete('/services/:id/:cod/:typeTable', ServicesController.remove);

// --- Order of Service ---
router.get('/order-of-service', OrderOfServiceController.getAll);
router.get('/order-of-service/:cod', OrderOfServiceController.getUnique);
router.put('/order-of-service/estimate/:cod', ValidateMiddleware.validateSchema(orderUpdateEstimateSchema), OrderOfServiceController.updateEstimate);
router.delete('/order-of-service/estimate/:cod/:idEstimate', OrderOfServiceController.removeEstimate);

// --- Status Service ---
router.get('/status-service', StatusServiceController.getAll);
router.post('/status-service', ValidateMiddleware.validateSchema(statusServiceCreateSchema), StatusServiceController.create);
router.delete('/status-service/:id', StatusServiceController.remove);

// --- Status Payment ---
router.get('/status-payment', StatusPaymentController.getAll);
router.post('/status-payment', ValidateMiddleware.validateSchema(statusPaymentCreateSchema), StatusPaymentController.create);
router.delete('/status-payment/:id', StatusPaymentController.remove);

// --- Types Product ---
router.get('/types-product', TypesProductController.getAll);
router.post('/types-product', ValidateMiddleware.validateSchema(typeProductCreateSchema), TypesProductController.create);
router.delete('/types-product/:id', TypesProductController.remove);

export default router;
