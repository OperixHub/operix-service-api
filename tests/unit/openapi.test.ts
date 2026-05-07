import { generateOpenApiDocument } from '../../src/core/docs/openapi.js';

describe('OpenAPI', () => {
  test('documenta as rotas essenciais de autenticação e perfil', () => {
    const document = generateOpenApiDocument();
    const paths = document.paths;

    expect(paths['/auth/config']?.get).toBeDefined();
    expect(paths['/auth/authorize']?.post).toBeDefined();
    expect(paths['/auth/callback']?.post).toBeDefined();
    expect(paths['/auth/login']?.post).toBeDefined();
    expect(paths['/auth/refresh']?.post).toBeDefined();
    expect(paths['/auth/me']?.get).toBeDefined();
    expect(paths['/auth/onboarding']?.post).toBeDefined();

    expect(paths['/profile/me']?.get).toBeDefined();
    expect(paths['/profile/me']?.patch).toBeDefined();
    expect(paths['/profile/company']?.get).toBeDefined();
    expect(paths['/profile/company']?.patch).toBeDefined();
    expect(paths['/profile/system']?.get).toBeDefined();
    expect(paths['/users/{id}/access']?.patch).toBeDefined();
  });
});
