import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class StockModel {
  id: number | null; name: string; code: string; description?: string;
  quantity: number; purchasePrice: number; salePrice: number;

  constructor({ id = null, name = '', code = '', description = '', quantity = 0, purchasePrice = 0, salePrice = 0 }: any = {}) {
    this.id = id; this.name = name; this.code = code; this.description = description;
    this.quantity = quantity; this.purchasePrice = purchasePrice; this.salePrice = salePrice;
  }

  static fromRequest(body: any = {}) { return new StockModel({ id: body.id || null, name: body.name, code: body.code, description: body.description, quantity: body.quantity, purchasePrice: body.purchasePrice, salePrice: body.salePrice }); }
  toJSON() { return { id: this.id, name: this.name, code: this.code, description: this.description, quantity: this.quantity, purchasePrice: this.purchasePrice, salePrice: this.salePrice }; }

  static schema = z.object({ id: z.number().nullable().optional(), name: z.string().min(1), code: z.string().min(1), description: z.string().nullable().optional(), quantity: z.number().int(), purchasePrice: z.number(), salePrice: z.number() }).openapi('Stock');
  static createSchema = z.object({ name: z.string().min(1, 'Campo "Nome" é obrigatório.'), code: z.string().min(1, 'Campo "Código" é obrigatório.'), description: z.string().nullable().optional(), quantity: z.number().int(), purchasePrice: z.number(), salePrice: z.number() }).openapi('StockCreate');
  static responseSchema = z.object({ success: z.boolean(), msg: z.string(), data: StockModel.schema }).openapi('StockResponse');
  static listResponseSchema = z.object({ success: z.boolean(), msg: z.string(), data: z.array(StockModel.schema) }).openapi('StockListResponse');
}
