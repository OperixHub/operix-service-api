import type { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  msg: string;
  data: T | null;
}

export default class ResponseHandler {
  static success<T>(res: Response, data: T, msg: string = 'Operação realizada com sucesso', status: number = 200) {
    if (status === 204) {
      return res.status(204).end();
    }

    const response: ApiResponse<T> = { success: true, msg, data };
    return res.status(status).json(response);
  }

  static error(res: Response, msg: string = 'Ocorreu um erro na operação', status: number = 500, data: unknown = null) {
    const response: ApiResponse = { success: false, msg, data: data as any };
    return res.status(status).json(response);
  }
}
