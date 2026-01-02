# TODO

Este arquivo lista tarefas importantes do projeto operix-api.
Marque as tarefas como concluídas ao finalizá-las.

## Prioridade: Alta
- [ ] Implementar a funcionalidade de tenants, para o mesmo ser criado a partir da inserção do nome da empresa na criação, e ao criar um outro usuário por um admin, deve inserir o mesmo tenants.

- [ ] Refatorar models para repositories/services
  - Objetivo: separar responsabilidades (Model = entidade/validação, Repository = queries/DB, Service = regras de negócio)
  - Arquivos alvo sugeridos:
    - `src/models/*` (schemas/factories)
    - `src/repositories/*` (mover queries dos atuais *Model.js)
    - `src/services/*` (orquestração e validação)
  - Observação: começar pelo `tenants` para validar o padrão.

- [ ] Adicionar validação com Joi (ou alternativa)
  - Instalar: `npm install joi --save`
  - Criar schemas para `tenant`, `user`, `orderOfService`, etc.

- [ ] Criar testes mínimos (Jest)
  - Instalar: `npm install --save-dev jest supertest` (se necessário)
  - Testes iniciais:
    - Repositório `tenants`: getAll / create / remove
    - Service `tenants`: validação de input e tratamento de erros

## Prioridade: Média
- [ ]

## Baixa prioridade / Futuro
- [ ]

---

Como trabalhar nas tarefas
- Escolha uma tarefa da seção "Prioridade: Alta".
- Crie uma branch por tarefa: `git checkout -b feat/refactor-tenants`
- Faça mudanças locais e rode testes.
- Abra PR descrevendo escopo e mudanças.