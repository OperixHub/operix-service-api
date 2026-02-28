import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export default class StatusServiceMiddleware {
  static createSchema = z.object({
    description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
    cod: z.union([z.string(), z.number()]).refine(val => val !== "", { message: 'Campo "Código" é obrigatório.' }),
    color: z.string().min(1, 'Campo "Cor" é obrigatório.')
  }).openapi("StatusServiceCreate");
}
