class TypesProductMiddleware {
  static validateCreate(req, res, next) {
    const { body } = req;

    if (typeof body.name === "undefined" || body.name === "") {
      return res.status(400).json({ msg: 'Campo "Descrição" é obrigatório.' });
    }

    next();
  }
}

export default TypesProductMiddleware;
