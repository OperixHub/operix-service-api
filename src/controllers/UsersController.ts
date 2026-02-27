import { type Request, type Response } from 'express';
import UsersService from '../services/UsersService';
import User from '../models/Users';

export default class UsersController {
  static async getAll(_req: any, res: Response) {
    const users = await UsersService.getAll();
    return res.status(200).json(users);
  }

  static async getSignature(req: Request, res: Response) {
    const user = User.fromRequestParams(req.params);
    const users = await UsersService.getSignature(user);
    return res.status(200).json(users);
  }

  static async remove(req: Request, res: Response) {
    try {
      const user = User.fromRequestParams(req.params);
      await UsersService.remove(user);
      return res.status(204).json();
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      return res.status(err.status || 500).json({ msg: err.message });
    }
  }
}
