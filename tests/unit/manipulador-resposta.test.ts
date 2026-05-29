import ManipuladorResposta from '../../src/core/utils/manipulador-resposta.js';

function criarResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

describe('ManipuladorResposta', () => {
  test('success retorna payload padronizado para respostas com conteúdo', () => {
    const res = criarResponseMock();

    ManipuladorResposta.sucesso(res, { id: 1 }, 'ok', 200);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      msg: 'ok',
      message: 'ok',
      data: { id: 1 },
    });
  });

  test('success retorna body vazio em respostas 204', () => {
    const res = criarResponseMock();

    ManipuladorResposta.sucesso(res, null, 'removed', 204);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('error retorna aliases compatíveis para mensagem', () => {
    const res = criarResponseMock();

    ManipuladorResposta.erro(res, 'Token expirado', 401);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      msg: 'Token expirado',
      message: 'Token expirado',
      data: null,
    });
  });
});
