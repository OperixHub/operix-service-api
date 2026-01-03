class ServicesMiddleware {
  static validateCreate(req, res, next) {
    const { body } = req;

    if (typeof body.product === "undefined" || body.product === "") {
      return res.status(400).json({ msg: 'Campo "Produto" é obrigatório.' });
    }
    if (typeof body.client === "undefined" || body.client === "") {
      return res.status(400).json({ msg: 'Campo "Cliente" é obrigatório.' });
    }
    if (typeof body.telephone === "undefined" || body.telephone === "") {
      return res.status(400).json({ msg: 'Campo "Telefone" é obrigatório.' });
    }
    if (typeof body.status === "undefined" || body.status === "") {
      return res.status(400).json({ msg: 'Campo "Status" é obrigatório.' });
    }

    next();
  }

  static validateUpdateInfoClient(req, res, next) {
    const { body } = req;

    if (typeof body.product === "undefined" || body.product === "") {
      return res.status(400).json({ msg: 'Campo "Produto" é obrigatório.' });
    }
    if (typeof body.client === "undefined" || body.client === "") {
      return res.status(400).json({ msg: 'Campo "Cliente" é obrigatório.' });
    }
    if (typeof body.telephone === "undefined" || body.telephone === "") {
      return res.status(400).json({ msg: 'Campo "Telefone" é obrigatório.' });
    }

    next();
  }
}

export default ServicesMiddleware;
