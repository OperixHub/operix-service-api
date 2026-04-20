import { env } from '../config/env.js';

interface Group {
  id: string;
  name: string;
  path: string;
  attributes?: Record<string, string[]>;
}

type CreateUserPayload = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  attributes?: Record<string, string[]>;
};

export default class KeycloakAdminService {
  private static get realmBaseUrl() {
    return `${env.keycloakUrl}/realms/${env.keycloakRealm}`;
  }

  private static get adminBaseUrl() {
    return `${env.keycloakUrl}/admin/realms/${env.keycloakRealm}`;
  }

  static async login(username: string, password: string) {
    const response = await fetch(`${this.realmBaseUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.keycloakClientId,
        grant_type: 'password',
        username,
        password,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Credenciais invÃ¡lidas ou erro no serviÃ§o de autenticaÃ§Ã£o.');
    }

    return response.json();
  }

  static async refreshToken(refreshToken: string) {
    const response = await fetch(`${this.realmBaseUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.keycloakClientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Falha ao renovar o token. FaÃ§a login novamente.');
    }

    return response.json();
  }

  static async getAdminToken() {
    const response = await fetch(`${env.keycloakUrl}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'admin-cli',
        grant_type: 'password',
        username: env.keycloakAdminUser,
        password: env.keycloakAdminPassword,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NÃ£o foi possÃ­vel autenticar a administraÃ§Ã£o: ${error}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  static async findGroupByName(groupName: string, adminToken: string): Promise<Group | null> {
    const response = await fetch(`${this.adminBaseUrl}/groups?search=${encodeURIComponent(groupName)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao buscar grupos: ${response.status} - ${error}`);
    }

    const groups = await response.json() as Group[];
    return groups.find((group) => group.name === groupName) || null;
  }

  static async ensureGroupExists(groupName: string, adminToken: string) {
    const existingGroup = await this.findGroupByName(groupName, adminToken);
    if (existingGroup) {
      return { groupId: existingGroup.id, created: false };
    }

    const response = await fetch(`${this.adminBaseUrl}/groups`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: groupName }),
    });

    if (response.status !== 201) {
      const error = await response.text();
      throw new Error(`Falha ao criar grupo "${groupName}": ${response.status} - ${error}`);
    }

    const createdGroup = await this.findGroupByName(groupName, adminToken);
    if (!createdGroup) {
      throw new Error('Grupo criado mas nÃ£o foi possÃ­vel obter seu ID.');
    }

    return { groupId: createdGroup.id, created: true };
  }

  static async createUser(payload: CreateUserPayload, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        enabled: true,
        credentials: [{
          type: 'password',
          value: payload.password,
          temporary: false,
        }],
        attributes: payload.attributes || {},
      }),
    });

    if (response.status !== 201) {
      const error = await response.text();
      throw new Error(`Falha ao criar usuÃ¡rio no IAM: ${response.status} - ${error}`);
    }

    const location = response.headers.get('Location');
    if (!location) {
      throw new Error('UsuÃ¡rio criado, mas nÃ£o foi possÃ­vel obter seu ID.');
    }

    return location.split('/').pop() as string;
  }

  static async addUserToGroup(userId: string, groupId: string, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao adicionar usuÃ¡rio ao grupo: ${response.status} - ${error}`);
    }
  }

  static async updateUserAttributes(userId: string, attributes: Record<string, string[]>, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attributes }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao atualizar atributos do usuÃ¡rio: ${response.status} - ${error}`);
    }
  }

  static async deleteUser(userId: string, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Falha ao remover usuÃ¡rio do IAM: ${response.status} - ${error}`);
    }
  }

  static async deleteGroup(groupId: string, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Falha ao remover grupo do IAM: ${response.status} - ${error}`);
    }
  }
}
