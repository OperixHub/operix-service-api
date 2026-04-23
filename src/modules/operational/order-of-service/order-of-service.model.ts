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
}
