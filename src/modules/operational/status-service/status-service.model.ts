import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class StatusServiceModel {
  id: number | null; tenant_id: number | null; description: string; cod: number | null; color: string;

  constructor({ id = null, tenant_id = null, description = '', cod = null, color = '' }: any = {}) {
    this.id = id; this.tenant_id = tenant_id; this.description = description; this.cod = cod; this.color = color;
  }

  static fromRequest(body: any = {}) { return new StatusServiceModel({ id: body.id || null, tenant_id: body.tenant_id || null, description: body.description, cod: body.cod, color: body.color }); }
  static fromRequestParams(params: any = {}) { return new StatusServiceModel({ id: params.id }); }
  toJSON() { return { id: this.id, tenant_id: this.tenant_id, description: this.description, cod: this.cod, color: this.color }; }

  static schema = z.object({ id: z.number().nullable().optional(), tenant_id: z.number().nullable().optional(), description: z.string().min(1), cod: z.number().nullable().optional(), color: z.string().optional() }).openapi('StatusService');
  static createSchema = z.object({ description: z.string().min(1, 'Campo "DescriÃ§Ã£o" Ã© obrigatÃ³rio.'), color: z.string().optional(), cod: z.number().nullable().optional() }).openapi('StatusServiceCreate');
  static responseSchema = z.object({ success: z.boolean(), msg: z.string(), data: StatusServiceModel.schema }).openapi('StatusServiceResponse');
  static listResponseSchema = z.object({ success: z.boolean(), msg: z.string(), data: z.array(StatusServiceModel.schema) }).openapi('StatusServiceListResponse');
}
