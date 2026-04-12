import UserModel from "../identity/users/users.model.js";
import UsersRepository from "../identity/users/users.repository.js";
import TenantModel from "../identity/tenants/tenants.model.js";
import TenantRepository from "../identity/tenants/tenants.repository.js";

interface Group {
  id: string;
  name: string;
  path: string;
  attributes?: Record<string, string[]>;
}

export default class AuthService {
  static readonly KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
  static readonly REALM = process.env.KEYCLOAK_REALM || 'operix-service';

  static async login(username: string, password: string) {
    try {
      const response = await fetch(`${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID || 'admin-cli',
          grant_type: 'password',
          username,
          password
        }).toString()
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas ou erro no serviço de autenticação.');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao realizar login no Keycloak.');
    }
  }

  static async getAdminToken() {
    try {
      const response = await fetch(`${this.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: 'admin-cli',
          grant_type: 'password',
          username: process.env.KEYCLOAK_ADMIN_USER || 'admin',
          password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin'
        }).toString()
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Não foi possível autenticar a administração: ${error}`);
      }
      const data: any = await response.json();
      return data.access_token;
    } catch (error: any) {
      throw new Error(`Falha ao obter token de admin: ${error.message}`);
    }
  }

  static async refreshToken(refreshToken: string) {
    try {
      const response = await fetch(`${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID || 'admin-cli',
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }).toString()
      });

      if (!response.ok) {
        throw new Error('Falha ao renovar o token. Faça login novamente.');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao renovar token no Keycloak.');
    }
  }

  static async findGroupByName(groupName: string, adminToken: string): Promise<Group | null> {
    const url = `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/groups?search=${encodeURIComponent(groupName)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao buscar grupos: ${response.status} - ${error}`);
    }

    const groups = await response.json() as Group[];
    return groups.find(g => g.name === groupName) || null;
  }

  static async createGroup(groupName: string, adminToken: string, attributes?: Record<string, string[]>): Promise<string> {
    const url = `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/groups`;
    const body: any = { name: groupName };
    if (attributes) {
      body.attributes = attributes;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.status === 201) {
      const createdGroup = await this.findGroupByName(groupName, adminToken);
      if (createdGroup) {
        return createdGroup.id;
      }
      throw new Error('Grupo criado mas não foi possível obter seu ID.');
    }

    const errorText = await response.text();
    throw new Error(`Falha ao criar grupo "${groupName}": ${response.status} - ${errorText}`);
  }

  static async ensureGroupExists(groupName: string, adminToken: string): Promise<string> {
    const existingGroup = await this.findGroupByName(groupName, adminToken);
    if (existingGroup) {
      return existingGroup.id;
    }
    return await this.createGroup(groupName, adminToken);
  }

  static async addUserToGroup(userId: string, groupId: string, adminToken: string): Promise<void> {
    const url = `${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users/${userId}/groups/${groupId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao adicionar usuário ao grupo: ${response.status} - ${errorText}`);
    }
  }

  static async register(data: UserModel) {
    const adminToken = await this.getAdminToken();
    const groupName: string = data.tenant || '';

    if (!groupName) {
      throw new Error('Empresa não informada.');
    }

    let groupId: string;
    try {
      groupId = await this.ensureGroupExists(groupName, adminToken);
    } catch (error: any) {
      throw new Error(`Não foi possível criar/verificar o grupo da filial: ${error.message}`);
    }

    const createUserResponse = await fetch(`${this.KEYCLOAK_URL}/admin/realms/${this.REALM}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' ') || data.name,
        enabled: true,
        credentials: [{
          type: 'password',
          value: data.password,
          temporary: false
        }],
        attributes: {
          admin: [data.admin ? data.admin.toString() : "false"],
          root: [data.root ? data.root.toString() : "false"],
          tenant: [data.tenant],
        }
      })
    });

    if (createUserResponse.status !== 201) {
      const errorText = await createUserResponse.text();
      throw new Error(`Falha ao criar usuário no IAM: ${createUserResponse.status} - ${errorText}`);
    }

    const location = createUserResponse.headers.get('Location');
    if (!location) {
      throw new Error('Usuário criado, mas não foi possível obter seu ID.');
    }

    const userId = location.split('/').pop()!;
    console.log(`[AuthService] Usuário criado no Keycloak com ID: ${userId}`);
    await this.addUserToGroup(userId, groupId, adminToken);

    // DEDUPLICATON: Check if tenant exists in DB first
    let dbTenant = await TenantRepository.findByKeycloakGroupId(groupId);
    if (!dbTenant) {
      console.log(`[AuthService] Criando nova empresa: ${data.tenant}`);
      const tenant = TenantModel.fromRequest({
        id: null,
        name: data.tenant,
        keycloak_group_id: groupId,
      });
      dbTenant = await TenantRepository.create(tenant);
      
      // Auto-cadastro de nova empresa -> Primeiro usuário é administrador
      data.admin = true;
      data.root = true;
    } else {
      console.log(`[AuthService] Registrando usuário em empresa existente: ${data.tenant}`);
    }

    data.tenant_id = dbTenant.id;
    data.keycloak_id = userId;
    data.password = ''; 

    console.log(`[AuthService] Persistindo usuário no banco local... ID Keycloak: ${data.keycloak_id}`);
    return await UsersRepository.create(data);
  }
}
