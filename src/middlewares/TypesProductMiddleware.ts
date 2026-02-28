import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export default class TypesProductMiddleware {
  static createSchema = z.object({
    name: z.string().min(1, 'Campo "Nome" é obrigatório.')
  }).openapi("TypeProductCreate");
}
