export function criarRequestMock({
  body = {},
  params = {},
  headers = {},
  user = undefined,
}: {
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  user?: any;
} = {}) {
  return {
    body,
    params,
    headers,
    user,
  } as any;
}

export function criarResponseMock() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}
