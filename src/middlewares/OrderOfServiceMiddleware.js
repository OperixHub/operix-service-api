class OrderOfServiceMiddleware {
  static validateUpdateEstimate(req, res, next) {
    const { body } = req;

    if (body.type == "simples") {
      if (typeof body.description === "undefined" || body.description === "") {
        return res.status(400).json({ msg: 'Campo "Descrição" é obrigatório.' });
      }
      if (typeof body.price === "undefined" || body.price === "") {
        return res.status(400).json({ msg: 'Campo "Preço" é obrigatório.' });
      }
    } else {
      if (typeof body.amount === "undefined" || body.amount === "") {
        return res.status(400).json({ msg: 'Campo "Quantidade" é obrigatório.' });
      }
      if (typeof body.description === "undefined" || body.description === "") {
        return res.status(400).json({ msg: 'Campo "Descrição" é obrigatório.' });
      }
      if (typeof body.price === "undefined" || body.price === "") {
        return res.status(400).json({ msg: 'Campo "Preço" é obrigatório.' });
      }
    }

    next();
  }
}

export default OrderOfServiceMiddleware;
