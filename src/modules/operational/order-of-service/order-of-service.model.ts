import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class OrderOfServiceModel {
  cod_order: number | null;
  tenant_id: number | null;
  estimate: string | null;
  value: number;
  created_at: string | null;

  constructor({ cod_order = null, tenant_id = null, estimate = null, value = 0, created_at = null }: any = {}) {
    this.cod_order = cod_order; this.tenant_id = tenant_id; this.estimate = estimate;
    this.value = value; this.created_at = created_at;
  }

  static fromRequest(body: any = {}) { return new OrderOfServiceModel({ cod_order: body.cod_order || null, tenant_id: body.tenant_id || null, estimate: body.estimate, value: body.value, created_at: body.created_at || null }); }
  static fromRequestParams(params: any = {}) { return new OrderOfServiceModel({ cod_order: params.cod || params.cod_order }); }
  toJSON() { return { cod_order: this.cod_order, tenant_id: this.tenant_id, estimate: this.estimate, value: this.value, created_at: this.created_at }; }

  static schema = z.object({ cod_order: z.union([z.string(), z.number()]).nullable().optional(), tenant_id: z.number().nullable().optional(), estimate: z.string().nullable().optional(), value: z.number().nullable().optional(), created_at: z.string().nullable().optional() }).openapi('OrderOfService');

  static createSchema = z.object({ estimate: z.string().nullable().optional(), value: z.number() }).openapi('OrderOfServiceCreate');

  static updateEstimateSchema = z.object({ type: z.string().min(1), description: z.string().min(1), price: z.union([z.string(), z.number()]).refine(val => val !== ''), amount: z.union([z.string(), z.number()]).optional() }).superRefine((data, ctx) => { if (data.type !== 'simples') { if (data.amount === undefined || data.amount === '') { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo "Quantidade" é obrigatório.', path: ['amount'] }); } } }).openapi('OrderUpdateEstimate');

  static responseSchema = z.object({ success: z.boolean(), msg: z.string(), data: OrderOfServiceModel.schema }).openapi('OrderOfServiceResponse');
  static listResponseSchema = z.object({ success: z.boolean(), msg: z.string(), data: z.array(OrderOfServiceModel.schema) }).openapi('OrderOfServiceListResponse');
}
