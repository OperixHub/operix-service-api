import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export default class UserModel {
  id: number | null;
  username: string;
  email: string;
  name: string;
  tenant?: string | null;
  tenant_id: number | null;
  keycloak_id?: string | null;
  password?: string | null;
  admin?: boolean | null;
  root?: boolean | null;

  constructor({
    id = null,
    username = '',
    email = '',
    tenant_id = null,
    keycloak_id = null,
    password = null,
    admin = false,
    root = false,
    tenant = null,
    name = ''
  }: any = {}) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.tenant_id = tenant_id;
    this.keycloak_id = keycloak_id;
    this.password = password;
    this.admin = admin;
    this.root = root;
    this.tenant = tenant;
    this.name = name;
  }

  static fromRequest(body: any = {}): UserModel {
    return new UserModel(
      {
        keycloak_id: body.keycloak_id || null,
        tenant_id: body.tenant_id || null,
        id: body.id || null,
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
        tenant: body.tenant,
        admin: body.admin || false,
        root: body.root || false
      }
    );
  }

  static fromRequestParams(params: any = {}): UserModel {
    return new UserModel({ id: params.id });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      username: this.username,
      email: this.email,
      tenant: this.tenant,
      tenant_id: this.tenant_id,
      keycloak_id: this.keycloak_id,
      admin: this.admin,
      root: this.root,
    };
  }

  static publicSchema = z.object(
    {
      id: z.number().nullable().optional(),
      username: z.string().min(1),
      email: z.string().email(),
      tenant: z.string().nullable().optional(),
      tenant_id: z.number().nullable().optional(),
      keycloak_id: z.string().nullable().optional(),
      admin: z.boolean().nullable().optional(),
      root: z.boolean().nullable().optional(),
      name: z.string().min(1)
    }).openapi('UserPublic');

  static schema = z.object(
    {
      id: z.number().nullable().optional(),
      username: z.string().min(1),
      email: z.string().email(),
      tenant: z.string().nullable().optional(),
      tenant_id: z.number().nullable().optional(),
      keycloak_id: z.string().nullable().optional(),
      password: z.string().nullable().optional(),
      admin: z.boolean().nullable().optional(),
      root: z.boolean().nullable().optional(),
      name: z.string().min(1)
    }).openapi('User');

  static listResponseSchema = z.object(
    {
      success: z.boolean(),
      msg: z.string(),
      data: z.array(UserModel.publicSchema)
    }).openapi('UserListResponse');
}
