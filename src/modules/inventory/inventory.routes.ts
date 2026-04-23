import { Router } from 'express';
import ValidateMiddleware from '../../core/middlewares/validate.middleware.js';
import StockController from './stock/stock.controller.js';
import { stockCreateSchema } from './stock/stock.schema.js';
import PermissionsMiddleware from '../../core/permissions/permissions.middleware.js';

const router = Router();

router.get('/stock', PermissionsMiddleware.requirePermission('inventory.stock.access'), StockController.getAll);
router.post(
  '/stock',
  PermissionsMiddleware.requirePermission('inventory.stock.access'),
  ValidateMiddleware.validateSchema(stockCreateSchema),
  StockController.create,
);
router.put('/stock/:id', PermissionsMiddleware.requirePermission('inventory.stock.access'), StockController.update);
router.delete('/stock/:id', PermissionsMiddleware.requirePermission('inventory.stock.access'), StockController.remove);

export default router;
