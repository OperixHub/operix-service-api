import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class TenantModel {
  id: number | null; name: string;

  constructor({ id = null, name = '' }: any = {}) { this.id = id; this.name = name; }
  static fromRequest(body: any = {}) { return new TenantModel({ id: body.id || null, name: body.name }); }
  toJSON() { return { id: this.id, name: this.name }; }

  static schema = z.object({ id: z.number().nullable().optional(), name: z.string().min(1) }).openapi('Tenant');
  static createSchema = z.object({ name: z.string().min(1, 'Campo "Nome" é obrigatório.') }).openapi('TenantCreate');
  static responseSchema = z.object({ success: z.boolean(), msg: z.string(), data: TenantModel.schema }).openapi('TenantResponse');
  static listResponseSchema = z.object({ success: z.boolean(), msg: z.string(), data: z.array(TenantModel.schema) }).openapi('TenantListResponse');
}
