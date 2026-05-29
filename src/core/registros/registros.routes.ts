import { Router } from 'express';
import RegistrosController from './registros.controller.js';

const router = Router();

router.get('/registros', RegistrosController.obterRegistrosPaginados);

export default router;
