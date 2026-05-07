import AuthMiddleware from '../../src/core/middlewares/auth.middleware.js';

function createResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AuthMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('authToken normaliza erro de token expirado para acionar refresh no frontend', async () => {
    const req: any = {
      headers: {
        authorization: 'Bearer expired-token',
      },
    };
    const res = createResponseMock();
    const next = jest.fn();

    jest.spyOn(AuthMiddleware, 'verifyRawToken').mockRejectedValue(new Error('Token inválido: jwt expired'));

    await AuthMiddleware.authToken(req, res, next);

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
