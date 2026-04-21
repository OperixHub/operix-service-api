import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class TenantModel {
  id: number | null;
  name: string;
  keycloak_group_id: string;

  constructor(
    { id = null,
      name = '',
      keycloak_group_id = ''
    }: any = {}) {
    this.id = id;
    this.name = name;
    this.keycloak_group_id = keycloak_group_id;
  }

  static fromRequest(body: any = {}) {
    return new TenantModel({
      id: body.id || null,
      name: body.name,
      keycloak_group_id: body.keycloak_group_id
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      keycloak_group_id: this.keycloak_group_id
    };
  }

  static schema = z.object(
    {
      id: z.number().nullable().optional(),
      name: z.string().min(1),
      keycloak_group_id: z.string().nullable().optional()
    }).openapi('Tenant');

  static createSchema = z.object(
    {
      name: z.string().min(1, 'Campo "Nome" Ã© obrigatÃ³rio.')
    }).openapi('TenantCreate');

  static responseSchema = z.object(
    {
      success: z.boolean(),
      msg: z.string(),
      data: TenantModel.schema
    }).openapi('TenantResponse');

  static listResponseSchema = z.object(
    {
      success: z.boolean(),
      msg: z.string(),
      data: z.array(TenantModel.schema)
    }).openapi('TenantListResponse');
}
