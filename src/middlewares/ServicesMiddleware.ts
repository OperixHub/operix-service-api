import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export default class ServicesMiddleware {
  static createSchema = z.object({
    product: z.string().min(1, 'Campo "Produto" é obrigatório.'),
    client: z.string().min(1, 'Campo "Cliente" é obrigatório.'),
    telephone: z.string().min(1, 'Campo "Telefone" é obrigatório.'),
    status: z.union([z.string(), z.number()]).refine(val => val !== "", { message: 'Campo "Status" é obrigatório.' })
  }).openapi("ServiceCreate");

  static updateInfoClientSchema = z.object({
    product: z.string().min(1, 'Campo "Produto" é obrigatório.'),
    client: z.string().min(1, 'Campo "Cliente" é obrigatório.'),
    telephone: z.string().min(1, 'Campo "Telefone" é obrigatório.')
  }).openapi("ServiceUpdateInfoClient");
}
