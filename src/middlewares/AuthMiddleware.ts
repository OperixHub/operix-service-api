import type { Request, Response, NextFunction } from "express";
import jwt, { type Secret } from "jsonwebtoken";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export default class AuthMiddleware {
  static registerSchema = z.object({
    username: z.string().min(1, 'Nome de Usuário é obrigatório.').openapi({example: "joao123"}),
    email: z.string().email('Email é obrigatório e deve ser válido.').openapi({example: "joao@operix.com.br"}),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres.').openapi({example: "senha123"}),
    confirmPassword: z.string().min(1, 'Confirmar Senha é obrigatório.'),
    tenant_id: z.union([z.string(), z.number()]).refine(val => val !== "", {
      message: 'Unidade é obrigatória.'
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  }).openapi("Register");

  static loginSchema = z.object({
    username: z.string().min(1, 'Usuário é obrigatório.').openapi({ example: "joao123" }),
    password: z.string().min(1, 'Senha é obrigatória.').openapi({ example: "senha123" }),
  }).openapi("Login");

  static authToken(req: Request, res: Response, next: NextFunction) {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ msg: "Acesso Negado!" });
      }
  
      try {
        const secret: Secret = process.env.SECRET as Secret;
        jwt.verify(token, secret);
        next();
      } catch (error) {
        return res.status(401).json({ msg: "Token Inválido!" });
      }
  }
}

export type RegisterSchema = z.infer<typeof AuthMiddleware.registerSchema>;
export type LoginSchema = z.infer<typeof AuthMiddleware.loginSchema>;