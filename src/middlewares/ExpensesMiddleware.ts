import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export default class ExpensesMiddleware {
  static createSchema = z.object({
    date: z.string().min(1, 'Campo "Data" é obrigatório.'),
    type: z.string().min(1, 'Campo "Tipo" é obrigatório.'),
    description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
    value: z.union([z.string(), z.number()]).refine(val => val !== "", { message: 'Campo "Valor" é obrigatório.' })
  }).openapi("ExpenseCreate");
}
