import type { Request, Response } from 'express';
import AutenticacaoService from './autenticacao.service.js';
import ManipuladorResposta from '../utils/manipulador-resposta.js';
import { sanitizarUsuario } from '../utils/sanitizar.js';
import AutenticacaoMiddleware from '../middlewares/autenticacao.middleware.js';
import PermissoesService from '../perfil/permissoes/permissoes.service.js';

export default class AutenticacaoController {
  static async config(_req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.obterConfiguracaoPublica();
      return ManipuladorResposta.sucesso(res, data, 'Configuração de autenticação carregada.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao carregar configuração.', 500);
    }
  }

  static async authorize(req: Request, res: Response) {
    try {
      const authorization_url = AutenticacaoService.construirUrlAutorizacao({
        redirectUri: req.body.redirect_uri,
        state: req.body.state,
        codeChallenge: req.body.code_challenge,
        identityProvider: req.body.identity_provider || 'google',
      });

      return ManipuladorResposta.sucesso(res, { authorization_url }, 'URL de autenticação gerada.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao iniciar autenticação.', 400);
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      const tokenData = await AutenticacaoService.trocarCodigoAutorizacao(
        req.body.code,
        req.body.redirect_uri,
        req.body.code_verifier,
      );

      const user = await AutenticacaoMiddleware.verificarTokenBruto(tokenData.access_token);
      return ManipuladorResposta.sucesso(res, AutenticacaoService.construirPayloadSessao(tokenData, user), 'Login realizado com sucesso.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao finalizar login.', 401);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const data = await AutenticacaoService.login(username, password);
      const user = await AutenticacaoMiddleware.verificarTokenBruto((data as any).access_token);
      return ManipuladorResposta.sucesso(res, AutenticacaoService.construirPayloadSessao(data, user), 'Login realizado com sucesso.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro no login.', 401);
    }
  }

  static async renovarToken(req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.renovarToken(req.body.refresh_token);
      const user = await AutenticacaoMiddleware.verificarTokenBruto((data as any).access_token);
      return ManipuladorResposta.sucesso(res, AutenticacaoService.construirPayloadSessao(data, user), 'Refresh token realizado com sucesso!', 200);
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Refresh token inválido ou expirado', 401);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      await AutenticacaoService.logout(req.body.refresh_token);
      return ManipuladorResposta.sucesso(res, null, 'Logout realizado com sucesso.', 200);
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao realizar logout.', 400);
    }
  }

  static async me(req: Request, res: Response) {
    const snapshot = await PermissoesService.obterPermissoesUsuarioAtual((req as any).user);
    return ManipuladorResposta.sucesso(res, {
      user: sanitizarUsuario((req as any).user),
      permissions: snapshot.effective_permissions,
      access: snapshot.access,
    }, 'Sessão carregada.');
  }

  static async concluirOnboarding(req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.concluirOnboarding((req as any).user, req.body);
      return ManipuladorResposta.sucesso(res, data, 'Onboarding concluído com sucesso.', 201);
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao concluir onboarding.', error.status || 400);
    }
  }
}
