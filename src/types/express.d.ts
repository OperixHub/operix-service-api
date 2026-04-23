import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: string;
      email: string;
      name?: string | null;
      username?: string | null;
      preferred_username: string;
      tenant_id: number;
      roles: string[];
      permissions?: string[];
      admin?: boolean;
      root?: boolean;
      id?: number; // ID local na tabela users (após provisionamento)
    };
  }
}
