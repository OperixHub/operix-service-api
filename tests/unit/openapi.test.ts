import { generateOpenApiDocument } from '../../src/core/docs/openapi.js';

describe('OpenAPI', () => {
  test('documenta as rotas essenciais de autenticação e perfil', () => {
    const document = generateOpenApiDocument();
    const paths = document.paths;

    expect(paths['/autenticacao/configuracao']?.get).toBeDefined();
    expect(paths['/autenticacao/autorizar']?.post).toBeDefined();
    expect(paths['/autenticacao/retorno']?.post).toBeDefined();
    expect(paths['/autenticacao/login']?.post).toBeDefined();
    expect(paths['/autenticacao/renovar']?.post).toBeDefined();
    expect(paths['/autenticacao/eu']?.get).toBeDefined();
    expect(paths['/autenticacao/onboarding']?.post).toBeDefined();

    expect(paths['/perfil/eu']?.get).toBeDefined();
    expect(paths['/perfil/eu']?.patch).toBeDefined();
    expect(paths['/perfil/empresa']?.get).toBeDefined();
    expect(paths['/perfil/empresa']?.patch).toBeDefined();
    expect(paths['/perfil/sistema']?.get).toBeDefined();
    expect(paths['/usuarios/{id}/acesso']?.patch).toBeDefined();
  });
});
