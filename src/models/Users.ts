// @ts-nocheck
export default class User {
  constructor({
    id = null,
    tenant_id = null,
    username = "",
    email = "",
    password = null,
    root = false,
    admin = false,
    signature = null,
    remember = false,
  }: any = {}) {
    this.id = id;
    this.tenant_id = tenant_id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.root = root;
    this.admin = admin;
    this.signature = signature;
    this.remember = remember;
  }

  static fromRequestLogin(body: any = {}) {
    return new User({
      username: body.username,
      password: body.password,
      remember: body.remember || false,
    });
  }

  static fromRequest(body: any = {}) {
    return new User({
      id: body.id || null,
      tenant_id: body.tenant_id || body.tenant || null,
      username: body.username,
      email: body.email,
      password: body.password || body.passwordHash || null,
      root: typeof body.root !== "undefined" ? body.root : false,
      admin: typeof body.admin !== "undefined" ? body.admin : false,
      signature: body.signature || null,
    });
  }

  static fromRequestParams(params: any = {}) {
    return new User({
      id: params.id
    });
  }

  toJSON() {
    return {
      id: this.id,
      tenant_id: this.tenant_id,
      username: this.username,
      email: this.email,
      root: this.root,
      admin: this.admin,
      signature: this.signature,
    };
  }
}
