import type { Request, Response } from 'express';
import StatusServicoService from './status-servico.service.js';
import ManipuladorResposta from '../../../core/utils/manipulador-resposta.js';
import StatusServicoModel from './status-servico.model.js';

export default class StatusServicoController {
  static async obterTodos(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await StatusServicoService.obterTodos(tenant_id), 'Status de serviço listados com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const statusData = StatusServicoModel.deRequisicao({ ...req.body, tenant_id });
    return ManipuladorResposta.sucesso(res, await StatusServicoService.criar(statusData), 'Status de serviço criado com sucesso', 201);
  }

  static async remover(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await StatusServicoService.remover(req.params.id, tenant_id), 'Status de serviço removido com sucesso', 204);
  }
}
