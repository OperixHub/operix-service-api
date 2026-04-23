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
}
