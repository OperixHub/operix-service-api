import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class UserModel {
  id: number | null; username: string; email: string; tenant_id: number | null; keycloak_id?: string | null;

  constructor({ id = null, username = '', email = '', tenant_id = null, keycloak_id = null }: any = {}) {
    this.id = id; this.username = username; this.email = email; this.tenant_id = tenant_id; this.keycloak_id = keycloak_id;
  }

  static fromRequest(body: any = {}) { return new UserModel({ id: body.id || null, username: body.username, email: body.email, tenant_id: body.tenant_id, keycloak_id: body.keycloak_id }); }
  static fromRequestParams(params: any = {}) { return new UserModel({ id: params.id }); }
  toJSON() { return { id: this.id, username: this.username, email: this.email, tenant_id: this.tenant_id }; }

  static schema = z.object({ id: z.number().nullable().optional(), username: z.string().min(1), email: z.string().email(), tenant_id: z.number().nullable().optional(), keycloak_id: z.string().nullable().optional() }).openapi('User');
  static listResponseSchema = z.object({ success: z.boolean(), msg: z.string(), data: z.array(UserModel.schema) }).openapi('UserListResponse');
}
