import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: string;
      email: string;
      preferred_username: string;
      tenant_id: number;
      roles: string[];
      id?: number; // ID local na tabela users (apÃ³s provisionamento)
    };
  }
}
