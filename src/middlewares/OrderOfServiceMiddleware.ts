import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export default class OrderOfServiceMiddleware {
  static updateEstimateSchema = z.object({
    type: z.string().min(1, 'Campo "Tipo" é obrigatório.'),
    description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
    price: z.union([z.string(), z.number()]).refine(val => val !== "", { message: 'Campo "Preço" é obrigatório.' }),
    amount: z.union([z.string(), z.number()]).optional()
  }).superRefine((data, ctx) => {
    if (data.type !== "simples") {
      if (data.amount === undefined || data.amount === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Campo "Quantidade" é obrigatório.',
          path: ["amount"]
        });
      }
    }
  }).openapi("OrderUpdateEstimate");
}
