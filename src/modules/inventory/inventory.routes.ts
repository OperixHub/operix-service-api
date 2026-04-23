import { Router } from 'express';
import RolesMiddleware from '../../core/middlewares/roles.middleware.js';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';
import StockController from './stock/stock.controller.js';
import { stockCreateSchema } from './stock/stock.schema.js';

const router = Router();
router.use(RolesMiddleware.requireRole('module:inventory'));

router.get('/stock', StockController.getAll);
router.post('/stock', ValidateMiddleware.validateSchema(stockCreateSchema), StockController.create);
router.put('/stock/:id', StockController.update);
router.delete('/stock/:id', StockController.remove);

export default router;
