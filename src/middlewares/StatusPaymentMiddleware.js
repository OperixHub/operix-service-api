class StatusPaymentMiddleware {
  static validateCreate(req, res, next) {
    const { body } = req;

    if (typeof body.description === "undefined" || body.description === "") {
      return res.status(400).json({ msg: 'Campo "Descrição" é obrigatório.' });
    }
    if (typeof body.cod === "undefined" || body.cod === "") {
      return res.status(400).json({ msg: 'Campo "Código" é obrigatório.' });
    }
    if (typeof body.color === "undefined" || body.color === "") {
      return res.status(400).json({ msg: 'Campo "Cor" é obrigatório.' });
    }

    next();
  }
}

export default StatusPaymentMiddleware;
