import {
  OpenAPIRegistry,
  OpenApiGeneratorV3
} from "@asteasolutions/zod-to-openapi";

import AuthMiddleware from "../middlewares/AuthMiddleware";

const registry = new OpenAPIRegistry();

registry.register("Register", AuthMiddleware.registerSchema);
registry.register("Login", AuthMiddleware.loginSchema);

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Autenticação"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: AuthMiddleware.registerSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "Usuário criado",
      content: {
        "application/json": {
          schema: AuthMiddleware.registerSchema
        }
      }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Autenticação"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: AuthMiddleware.loginSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: "Usuário logado",
      content: {
        "application/json": {
          schema: AuthMiddleware.loginSchema
        }
      }
    }
  }
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Operix API",
        description: "API do sistema de gestão inteligente para serviços técnicos e manutenções (Operix).",
        contact: {
          name: 'João Pedro P. Lima',
          url: 'https://joaopedrosh.github.io/website',
          email: 'devx.contato@gmail.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3333',
          description: 'Desenvolvimento'
        },
        {
          url: 'https://operix-service-api.cloudx.work',
          description: "Produção"
        }
      ],
  });
}