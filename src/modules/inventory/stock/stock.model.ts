export default class StockModel {
  id: number | null; name: string; code: string; description?: string;
  quantity: number; purchasePrice: number; salePrice: number;

  constructor({ id = null, name = '', code = '', description = '', quantity = 0, purchasePrice = 0, salePrice = 0 }: any = {}) {
    this.id = id; this.name = name; this.code = code; this.description = description;
    this.quantity = quantity; this.purchasePrice = purchasePrice; this.salePrice = salePrice;
  }

  static fromRequest(body: any = {}) { return new StockModel({ id: body.id || null, name: body.name, code: body.code, description: body.description, quantity: body.quantity, purchasePrice: body.purchasePrice, salePrice: body.salePrice }); }
  toJSON() { return { id: this.id, name: this.name, code: this.code, description: this.description, quantity: this.quantity, purchasePrice: this.purchasePrice, salePrice: this.salePrice }; }
}
