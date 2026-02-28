import type { Request, Response } from 'express';
import type { RegisterSchema, LoginSchema } from "../middlewares/AuthMiddleware";
import UsersService from '../services/UsersService';
import User from '../models/Users';

export default class AuthController {
  static async register(req: Request<{}, {}, RegisterSchema>, res: Response) {
    try {
      const user = User.fromRequest(req.body);
      const register = await UsersService.register(user);
      return res.status(200).json(register);
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      res.status(err.status || 500).json({ msg: err.message });
    }
  }

  static async login(req: Request<{}, {}, LoginSchema>, res: Response) {
    try {
      console.log(req.body)
      const user = User.fromRequestLogin(req.body);
      const login = await UsersService.login(user);
      return res.status(200).json({ token: login.token, user: login.userData });
    } catch (error: unknown) {
      const err = error as Error & { status?: number };
      res.status(err.status || 500).json({ msg: err.message });
    }
  }
}