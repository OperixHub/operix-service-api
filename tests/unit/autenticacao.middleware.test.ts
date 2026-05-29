import AutenticacaoMiddleware from '../../src/core/middlewares/autenticacao.middleware.js';

function criarResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AutenticacaoMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('autenticarToken normaliza erro de token expirado para acionar refresh no frontend', async () => {
    const req: any = {
      headers: {
        authorization: 'Bearer expired-token',
      },
    };
    const res = criarResponseMock();
    const next = jest.fn();

    jest.spyOn(AutenticacaoMiddleware, 'verificarTokenBruto').mockRejectedValue(new Error('Token inválido: jwt expired'));

    await AutenticacaoMiddleware.autenticarToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      msg: 'Token expirado',
      message: 'Token expirado',
      data: null,
    });
  });
});
