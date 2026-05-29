export default class StatusPagamentoModel {
  id: number | null; tenant_id: number | null; description: string; cod: number | null; color: string;

  constructor({ id = null, tenant_id = null, description = '', cod = null, color = '' }: any = {}) {
    this.id = id; this.tenant_id = tenant_id; this.description = description; this.cod = cod; this.color = color;
  }

  static deRequisicao(body: any = {}) { return new StatusPagamentoModel({ id: body.id || null, tenant_id: body.tenant_id || null, description: body.description, cod: body.cod, color: body.color }); }
  static deParametrosRequisicao(params: any = {}) { return new StatusPagamentoModel({ id: params.id }); }
  toJSON() { return { id: this.id, tenant_id: this.tenant_id, description: this.description, cod: this.cod, color: this.color }; }
}
