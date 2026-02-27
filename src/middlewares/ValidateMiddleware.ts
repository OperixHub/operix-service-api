import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

class ValidateMiddleware {
  static validateSchema(schema: ZodSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({ msg: "Dados inválidos", error: result.error.message });
      }

      req.body = result.data;
      next();
    };
  }
}

export default ValidateMiddleware;