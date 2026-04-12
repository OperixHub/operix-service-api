import type { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  msg: string;
  data: T | null;
}

export default class ResponseHandler {
  static success<T>(res: Response, data: T, msg: string = 'Operação realizada com sucesso', status: number = 200) {
    const response: ApiResponse<T> = { success: true, msg, data };
    return res.status(status).json(response);
  }

  static error(res: Response, msg: string = 'Ocorreu um erro na operação', status: number = 500, data: any = null) {
    const response: ApiResponse = { success: false, msg, data };
    return res.status(status).json(response);
  }
}
