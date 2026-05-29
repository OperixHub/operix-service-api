import type { Request, Response } from 'express';
import RegistrosService from '../registros/registros.service.js';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

export default class RegistrosController {
  static async obterRegistrosPaginados(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await RegistrosService.obterRegistrosPaginados(tenant_id, page, limit);
    return ManipuladorResposta.sucesso(res, logs, 'Logs listados com sucesso');
  }
}
