import { Router } from 'express';
import RolesMiddleware from '../../core/middlewares/roles.middleware.js';
import StockController from './stock/stock.controller.js';

const router = Router();
router.use(RolesMiddleware.requireRole('module:inventory'));

router.get('/stock', StockController.getAll);
router.post('/stock', StockController.create);
router.put('/stock/:id', StockController.update);
router.delete('/stock/:id', StockController.remove);

export default router;
