import type { Request, Response } from 'express';
import InformacoesSistemaService from './informacoes-sistema.service.js';
import ManipuladorResposta from '../../../core/utils/manipulador-resposta.js';

export default class InformacoesSistemaController {
  static async obterInformacoesSistema(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await InformacoesSistemaService.obterInformacoesSistema(tenant_id), 'Informações do sistema obtidas com sucesso');
  }
}
