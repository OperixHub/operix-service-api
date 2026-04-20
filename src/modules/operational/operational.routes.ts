import { Router } from 'express';
import RolesMiddleware from '../../core/middlewares/roles.middleware.js';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';

import ServicesController from './services/services.controller.js';
import ServiceModel from './services/services.model.js';

import OrderOfServiceController from './order-of-service/order-of-service.controller.js';
import OrderOfServiceModel from './order-of-service/order-of-service.model.js';

import StatusServiceController from './status-service/status-service.controller.js';
import StatusServiceModel from './status-service/status-service.model.js';

import StatusPaymentController from './status-payment/status-payment.controller.js';
import StatusPaymentModel from './status-payment/status-payment.model.js';

import TypesProductController from './types-product/types-product.controller.js';
import TypesProductModel from './types-product/types-product.model.js';

const router = Router();

// Toda rota deste mÃ³dulo exige a role module:operational
router.use(RolesMiddleware.requireRole('module:operational'));

// â€”â€”â€” Services â€”â€”â€”
router.get('/services', ServicesController.getAll);
router.get('/services/warehouse', ServicesController.getAllWharehouse);
router.post('/services', ValidateMiddleware.validateSchema(ServiceModel.createSchema), ServicesController.create);
router.put('/services/warehouse/:id/:value', ServicesController.updateWarehouse);
router.put('/services/info/client/:id', ValidateMiddleware.validateSchema(ServiceModel.updateInfoClientSchema), ServicesController.updateInfoClient);
router.put('/services/status/:id/:status', ServicesController.updateStatusService);
router.put('/services/status/payment/:id/:status', ServicesController.updateStatusPayment);
router.delete('/services/:id/:cod/:typeTable', ServicesController.remove);

// â€”â€”â€” Order of Service â€”â€”â€”
router.get('/order-of-service', OrderOfServiceController.getAll);
router.get('/order-of-service/:cod', OrderOfServiceController.getUnique);
router.put('/order-of-service/estimate/:cod', ValidateMiddleware.validateSchema(OrderOfServiceModel.updateEstimateSchema), OrderOfServiceController.updateEstimate);
router.delete('/order-of-service/estimate/:cod/:idEstimate', OrderOfServiceController.removeEstimate);

// â€”â€”â€” Status Service â€”â€”â€”
router.get('/status-service', StatusServiceController.getAll);
router.post('/status-service', ValidateMiddleware.validateSchema(StatusServiceModel.createSchema), StatusServiceController.create);
router.delete('/status-service/:id', StatusServiceController.remove);

// â€”â€”â€” Status Payment â€”â€”â€”
router.get('/status-payment', StatusPaymentController.getAll);
router.post('/status-payment', ValidateMiddleware.validateSchema(StatusPaymentModel.createSchema), StatusPaymentController.create);
router.delete('/status-payment/:id', StatusPaymentController.remove);

// â€”â€”â€” Types Product â€”â€”â€”
router.get('/types-product', TypesProductController.getAll);
router.post('/types-product', ValidateMiddleware.validateSchema(TypesProductModel.createSchema), TypesProductController.create);
router.delete('/types-product/:id', TypesProductController.remove);

export default router;
