class UsersMiddleware {
  static validateRegister(req, res, next) {
    const { body } = req;

    if (typeof body.username === "undefined" || body.username === "") {
      return res.status(400).json({ msg: 'Campo "Nome de Usuário" é obrigatório.' });
    }
    if (typeof body.email === "undefined" || body.email === "") {
      return res.status(400).json({ msg: 'Campo "Email" é obrigatório.' });
    }

    if (typeof body.password === "undefined" || body.password === "") {
      return res.status(400).json({ msg: 'Campo "Senha" é obrigatório.' });
    }
    if (
      typeof body.confirmPassword === "undefined" ||
      body.confirmPassword === ""
    ) {
      return res.status(400).json({ msg: 'Campo "Confirmar Senha" é obrigatório.' });
    }

    if (body.password !== body.confirmPassword) {
      return res.status(400).json({ msg: 'As senhas não conferem.' });
    }

    next();
  }

  static validateLogin(req, res, next) {
    const { body } = req;

    if (typeof body.username === "undefined" || body.username === "") {
      return res.status(400).json({ msg: 'Campo "Nome de Usuário" é obrigatório.' });
    }
    if (typeof body.password === "undefined" || body.password === "") {
      return res.status(400).json({ msg: 'Campo "Senha" é obrigatório.' });
    }

    next();
  }
}

export default UsersMiddleware;
