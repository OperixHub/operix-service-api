# Operix Service API

API RESTful para gestão operacional, estoque, identidade e notificações do ecossistema Operix.

## Visão Geral

- Runtime principal: `Bun`
- Framework HTTP: `Express`
- Banco de dados: `PostgreSQL`
- Identidade e autorização: `Keycloak`
- Documentação: `Swagger/OpenAPI`
- Comunicação em tempo real: `Socket.IO`

O projeto segue uma organização modular com `controllers`, `services`, `repositories`, `models` e `middlewares`, buscando baixa acoplagem e responsabilidades mais claras entre HTTP, regra de negócio, persistência e integração com IAM.

## Principais Ajustes Aplicados

- Centralização de variáveis de ambiente em `src/core/config/env.ts`
- Endpoints de identidade organizados em `/api/identity/*`
- Correção do fluxo de autenticação e provisionamento multi-tenant
- Compensação básica em cadastro para evitar órfãos no Keycloak
- Respostas HTTP mais alinhadas ao REST, incluindo `204 No Content`
- Endurecimento de segurança com headers HTTP e validação mais explícita
- Sanitização de dados sensíveis em respostas de usuário
- Pipeline CI com GitHub Actions

## Pré-requisitos

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Variáveis de Ambiente

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Revise os valores de banco, Keycloak e CORS no arquivo `.env`.

## Como Rodar Localmente

1. Instale as dependências:

```bash
bun install
```

2. Suba os serviços de apoio:

```bash
docker compose up -d postgres keycloak pgadmin
```

3. Rode as migrações:

```bash
bun run migrate
```

4. Opcionalmente carregue seeds:

```bash
bun run seed
```

5. Inicie a API em desenvolvimento:

```bash
bun run dev
```

6. Acesse:

- API: [http://localhost:3333](http://localhost:3333)
- Healthcheck: [http://localhost:3333/health](http://localhost:3333/health)
- Swagger: [http://localhost:3333/docs](http://localhost:3333/docs)
- Keycloak: [http://localhost:8080](http://localhost:8080)
- PgAdmin: [http://localhost:5050](http://localhost:5050)

## Como Rodar com Docker

O `compose.yaml` já possui a API, PostgreSQL, Keycloak e PgAdmin.

1. Garanta que `.env` exista na raiz.
2. Suba todo o ambiente:

```bash
docker compose up -d --build
```

3. Execute as migrações com a aplicação disponível:

```bash
docker compose exec api bun run migrate
```

4. Para derrubar o ambiente:

```bash
docker compose down -v
```

## Scripts Úteis

- `bun run dev`: sobe a API em modo desenvolvimento
- `bun run start`: sobe a API em modo normal
- `bun run build`: gera build em `dist/`
- `bun run lint`: valida padrões de código
- `bun run typecheck`: valida tipos TypeScript
- `bun run test`: executa toda a suíte
- `bun run test:unit`: executa testes unitários
- `bun run test:integration`: executa testes de integração
- `bun run check`: executa lint, typecheck e testes

## Segurança e LGPD

- Autenticação JWT com validação por `issuer` e `JWKS`
- Autorização por roles
- Isolamento por `tenant_id`
- Remoção de `password` das respostas públicas
- Logs sem persistência direta de payload sensível
- Headers de segurança HTTP básicos

Para avançar na aderência à LGPD em produção, recomenda-se complementar com:

- política de retenção de logs
- mascaramento de PII em exports administrativos
- trilha de auditoria para consentimento e exclusão
- processo operacional para atendimento de titulares

## Testes

Os testes ficam em `tests/unit` e `tests/integration`.

Cobertura atual priorizada:

- fluxo de cadastro com Keycloak e persistência local
- compensação em falha de cadastro
- padronização das respostas HTTP
- rotas principais de identidade

## CI/CD

A pipeline em `.github/workflows/ci.yml` executa:

1. instalação das dependências com Bun
2. lint
3. typecheck
4. testes
5. build da aplicação

## Guia Básico de Deploy em VPS

1. Instale Docker e Docker Compose na VPS.
2. Clone o repositório no servidor.
3. Crie e ajuste o `.env` com URLs e credenciais reais.
4. Suba os containers:

```bash
docker compose up -d --build
```

5. Rode as migrações:

```bash
docker compose exec api bun run migrate
```

6. Coloque a API atrás de um reverse proxy como Nginx ou Traefik.
7. Publique HTTPS com Let's Encrypt.
8. Restrinja portas administrativas como PgAdmin e Keycloak.

## Estrutura Resumida

```text
src/
  core/
    auth/
    config/
    docs/
    identity/
    logs/
    middlewares/
    utils/
  modules/
    inventory/
    notifications/
    operational/
tests/
  integration/
  unit/
```
