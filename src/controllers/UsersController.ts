import { type Request, type Response } from 'express';
import UsersService from '../services/UsersService.js';
import User from '../models/Users.js';

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

  static async register(req: Request, res: Response) {
    try {
      const user = User.fromRequest(req.body);
      const register = await UsersService.register(user);
      return res.status(200).json(register);
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      res.status(err.status || 500).json({ msg: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const user = User.fromRequestLogin(req.body);
      const login = await UsersService.login(user);
      return res.status(200).json({ token: login.token, user: login.userData });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      res.status(err.status || 500).json({ msg: err.message });
    }
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
