import jwt from 'jsonwebtoken';

export default class AuthService {
  static readonly KEYCLOAK_URL = 'http://127.0.0.1:8080';
  static readonly REALM = 'operixauth';

  static async login(username: string, password: string) {
    const response = await fetch(`${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'admin-cli',
        grant_type: 'password',
        username,
        password
      }).toString()
    });

    if (!response.ok) {
      throw new Error('Credenciais inválidas ou erro no serviço de autenticação.');
    }

    const data = await response.json();
    return data;
  }

  static async getAdminToken() {
    const response = await fetch(`${this.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'admin-cli',
        grant_type: 'password',
        username: 'admin',
        password: 'admin'
      }).toString()
    });

    if (!response.ok) throw new Error('Não foi possível autenticar a administração.');
    const data = await response.json();
    return (data as any).access_token;
  }

  static async register(userData: any) {
    const adminToken = await this.getAdminToken();

    const response = await fetch(`${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ').slice(1).join(' '),
        enabled: true,
        credentials: [{
          type: 'password',
          value: userData.password,
          temporary: false
        }],
        attributes: {
          tenant_id: [userData.tenant_id ? userData.tenant_id.toString() : "1"]
        }
      })
    });

    if (response.status !== 201) {
      throw new Error('Falha ao criar o usuário no IAM. Talvez o username/email já exista.');
    }

    // Assign standard modules roles
    // To do this we first need to get the user ID we just created
    // But for this proxy MVP it's sufficient to let the system generate them
    // Roles map logic might be required, but Keycloak can have default realm roles (like module:operational)

    return true;
  }
}
