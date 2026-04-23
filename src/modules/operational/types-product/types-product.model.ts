export default class TypesProductModel {
  id: number | null; tenant_id: number | null; name: string;

  constructor({ id = null, tenant_id = null, name = '' }: any = {}) {
    this.id = id; this.tenant_id = tenant_id; this.name = name;
  }

  static fromRequest(body: any = {}) { return new TypesProductModel({ id: body.id || null, tenant_id: body.tenant_id || null, name: body.name }); }
  static fromRequestParams(params: any = {}) { return new TypesProductModel({ id: params.id }); }
  toJSON() { return { id: this.id, tenant_id: this.tenant_id, name: this.name }; }
}
