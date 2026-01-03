import UsersService from "../services/UsersService.js";
import User from "../models/Users.js";

export default class UsersController {
  static async getAll(_req, res) {
    const users = await UsersService.getAll();
    return res.status(200).json(users);
  }

  static async getSignature(req, res) {
    const user = User.fromRequestParams(req.params);
    const users = await UsersService.getSignature(user);
    return res.status(200).json(users);
  }

  static async register(req, res) {
    try {
      const user = User.fromRequest(req.body);
      const register = await UsersService.register(user);
      return res.status(200).json(register);
    } catch (error) {
      res.status(error.status || 500).json({ msg: error.message });
    }
  }

  static async login(req, res) {
    try {
      const user = User.fromRequestLogin(req.body);
      const login = await UsersService.login(user);
      return res.status(200).json({ token: login.token, user: login.userData });
    } catch (error) {
      res.status(error.status || 500).json({ msg: error.message });
    }
  }

  static async remove(req, res) {
    try {
      const user = User.fromRequestParams(req.params);
      await UsersService.remove(user);
      return res.status(204).json();
    } catch (error) {
      return res.status(error.status || 500).json({ msg: error.message });
    }
  }
}
