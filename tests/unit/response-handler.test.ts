import ResponseHandler from '../../src/core/utils/response-handler.js';

function createResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

describe('ResponseHandler', () => {
  test('success retorna payload padronizado para respostas com conteúdo', () => {
    const res = createResponseMock();

    ResponseHandler.success(res, { id: 1 }, 'ok', 200);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      msg: 'ok',
      message: 'ok',
      data: { id: 1 },
    });
  });

  test('success retorna body vazio em respostas 204', () => {
    const res = createResponseMock();

    ResponseHandler.success(res, null, 'removed', 204);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  test('error retorna aliases compatíveis para mensagem', () => {
    const res = createResponseMock();

    ResponseHandler.error(res, 'Token expirado', 401);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      msg: 'Token expirado',
      message: 'Token expirado',
      data: null,
    });
  });
});
