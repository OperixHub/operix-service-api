/* ==========================================================================
   Operix Hub - API Client Services
   ========================================================================== */

import { showToast } from './helpers.js';

function extractBackendMessage(payload, fallback = '') {
  if (!payload) return fallback;

  if (typeof payload === 'string') {
    const text = payload.trim();
    return text || fallback;
  }

  const candidates = [
    payload.message,
    payload.msg,
    payload.error,
    payload.detail,
    payload?.data?.message,
    payload?.data?.msg,
    payload?.data?.error,
  ];

  const match = candidates.find((value) => typeof value === 'string' && value.trim());
  return match ? match.trim() : fallback;
}

function maskToken(token) {
  if (!token) return 'none';
  if (token.length <= 12) return `${token.slice(0, 4)}...`;
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

class ApiClient {
  constructor() {
    this.baseUrl = ''; // URL relativa para o monólito
    this.refreshPromise = null;
  }

  getAccessToken() {
    return (
      localStorage.getItem('operix_access_token') ||
      sessionStorage.getItem('operix_access_token') ||
      localStorage.getItem('operix_id_token') ||
      sessionStorage.getItem('operix_id_token')
    );
  }

  getIdToken() {
    return localStorage.getItem('operix_id_token') || sessionStorage.getItem('operix_id_token');
  }

  getRefreshToken() {
    return localStorage.getItem('operix_refresh_token') || sessionStorage.getItem('operix_refresh_token');
  }

  setSession(sessionData) {
    const accessToken = sessionData?.access_token || sessionData?.token || sessionData?.accessToken || null;
    const idToken = sessionData?.id_token || sessionData?.idToken || null;
    const refreshToken = sessionData?.refresh_token || sessionData?.refreshToken || null;

    if (!accessToken && !idToken) {
      this.clearSession();
      return;
    }

    if (accessToken) {
      localStorage.setItem('operix_access_token', accessToken);
      sessionStorage.setItem('operix_access_token', accessToken);
    }

    if (idToken) {
      localStorage.setItem('operix_id_token', idToken);
      sessionStorage.setItem('operix_id_token', idToken);
    }

    if (refreshToken) {
      localStorage.setItem('operix_refresh_token', refreshToken);
      sessionStorage.setItem('operix_refresh_token', refreshToken);
    }

    if (sessionData?.user) {
      localStorage.setItem('operix_user', JSON.stringify(sessionData.user));
      sessionStorage.setItem('operix_user', JSON.stringify(sessionData.user));
    }

    if (sessionData?.permissions) {
      localStorage.setItem('operix_permissions', JSON.stringify(sessionData.permissions));
      sessionStorage.setItem('operix_permissions', JSON.stringify(sessionData.permissions));
    }

    if (sessionData?.access) {
      localStorage.setItem('operix_access', JSON.stringify(sessionData.access));
      sessionStorage.setItem('operix_access', JSON.stringify(sessionData.access));
    }
  }

  clearSession() {
    localStorage.removeItem('operix_access_token');
    sessionStorage.removeItem('operix_access_token');
    localStorage.removeItem('operix_id_token');
    sessionStorage.removeItem('operix_id_token');
    localStorage.removeItem('operix_refresh_token');
    sessionStorage.removeItem('operix_refresh_token');
    localStorage.removeItem('operix_user');
    sessionStorage.removeItem('operix_user');
    localStorage.removeItem('operix_permissions');
    sessionStorage.removeItem('operix_permissions');
    localStorage.removeItem('operix_access');
    sessionStorage.removeItem('operix_access');
    sessionStorage.removeItem('operix_oauth_state');
    sessionStorage.removeItem('operix_oauth_verifier');
    sessionStorage.removeItem('operix_oauth_redirect_uri');
    sessionStorage.removeItem('operix_oauth_provider');
  }

  getUser() {
    try {
      const user = localStorage.getItem('operix_user') || sessionStorage.getItem('operix_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  /**
   * Faz uma chamada HTTP para a API.
   * @param {string} endpoint 
   * @param {object} options 
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = { ...options };
    const requestHeaders = new Headers(options.headers || {});
    const isAuthEndpoint = endpoint.startsWith('/api/autenticacao');

    // Configura headers padrão
    if (!requestHeaders.has('Content-Type') && requestOptions.method !== 'GET') {
      requestHeaders.set('Content-Type', 'application/json');
    }
    if (!requestHeaders.has('Accept')) {
      requestHeaders.set('Accept', 'application/json');
    }

    // Injeta Token de Acesso se estiver autenticado
    const token = this.getAccessToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    if (isAuthEndpoint) {
      console.debug('[API auth request]', {
        endpoint,
        method: requestOptions.method || 'GET',
        hasAuthorization: requestHeaders.has('Authorization'),
        tokenPreview: maskToken(token),
      });
    }

    requestOptions.headers = requestHeaders;

    try {
      let response = await fetch(url, requestOptions);

      if (isAuthEndpoint) {
        console.debug('[API auth response]', {
          endpoint,
          status: response.status,
          ok: response.ok,
          hasAuthorization: requestHeaders.has('Authorization'),
        });
      }

      // Tratamento de Token Expirado (401)
      if (response.status === 401 && this.shouldTryRefresh(endpoint) && this.getRefreshToken()) {
        if (isAuthEndpoint) {
          console.debug('[API auth refresh]', {
            endpoint,
            reason: '401 received, attempting refresh token flow',
          });
        }
        await this.ensureFreshSession();
        const refreshedToken = this.getAccessToken();
        if (refreshedToken) {
          requestOptions.headers.set('Authorization', `Bearer ${refreshedToken}`);
        }
        response = await fetch(url, requestOptions);

        if (isAuthEndpoint) {
          console.debug('[API auth response after refresh]', {
            endpoint,
            status: response.status,
            ok: response.ok,
            hasAuthorization: requestOptions.headers.has('Authorization'),
            tokenPreview: maskToken(refreshedToken),
          });
        }
      }

      // Analisa o retorno
      if (response.status === 204) {
        return null;
      }

      const payload = await this.parseResponseBody(response);

      if (!response.ok) {
        // Erro retornado pela API padronizada
        const errorMsg = extractBackendMessage(payload, 'Erro na requisição.');
        const err = new Error(errorMsg);
        err.status = response.status;
        err.payload = payload;
        throw err;
      }

      if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload.data;
      }

      return payload;

    } catch (error) {
      // Ignora erro se for o próprio fluxo interno de redirecionamento
      if (error.message === 'Token de refresh expirado') {
        throw error;
      }
      
      // Tratamento global de erros específicos
      if (error.status === 403) {
        showToast(error.message || 'Acesso negado: você não tem permissão para realizar esta ação.', 'error');
      } else if (error.status === 500) {
        showToast(error.message || 'Erro interno no servidor. Tente novamente mais tarde.', 'error');
      } else if (error.status === 404 && endpoint.includes('/api/')) {
        showToast(error.message || 'Recurso não encontrado.', 'warning');
      } else if (error.status === 422) {
        showToast(error.message || 'Dados inválidos.', 'warning');
      }
      
      throw error;
    }
  }

  // Atalhos HTTP
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Fluxos de Autenticação específicos
  async login(username, password) {
    const payload = await this.post('/api/autenticacao/login', { username, password });
    this.setSession(payload);
    await this.hydrateSession();
    return payload;
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.post('/api/autenticacao/sair', { refresh_token: refreshToken });
      } catch (e) {
        console.error('Falha ao deslogar no backend:', e);
      }
    }
    this.clearSession();
    window.location.hash = '#/login';
  }

  async renewToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('Token de refresh expirado');
    
    try {
      const response = await fetch('/api/autenticacao/renovar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        const payload = await this.parseResponseBody(response);
        throw new Error(extractBackendMessage(payload, 'Falha ao renovar token'));
      }

      const payload = await this.parseResponseBody(response);
      const session = payload?.data || payload?.dados || payload;
      this.setSession(session);
      return session;
    } catch (e) {
      this.clearSession();
      throw e;
    }
  }

  getPermissions() {
    try {
      const perms = localStorage.getItem('operix_permissions') || sessionStorage.getItem('operix_permissions');
      return perms ? JSON.parse(perms) : [];
    } catch {
      return [];
    }
  }

  hasPermission(permissionKey) {
    const user = this.getUser();
    if (user?.admin || user?.root) return true;
    
    const permissions = this.getPermissions();
    return permissions.includes(permissionKey);
  }

  getAccess() {
    try {
      const acc = localStorage.getItem('operix_access') || sessionStorage.getItem('operix_access');
      return acc ? JSON.parse(acc) : null;
    } catch {
      return null;
    }
  }

  shouldTryRefresh(endpoint) {
    const authPaths = [
      '/api/autenticacao/login',
      '/api/autenticacao/autorizar',
      '/api/autenticacao/retorno',
      '/api/autenticacao/renovar',
      '/api/autenticacao/sair',
      '/api/autenticacao/configuracao',
    ];

    return !authPaths.some((path) => endpoint.includes(path));
  }

  async ensureFreshSession() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.renewToken()
      .catch((err) => {
        this.clearSession();
        window.dispatchEvent(new CustomEvent('auth:expired', { detail: err }));
        throw err;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  async parseResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return text ? { message: text } : null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async hydrateSession() {
    const token = this.getAccessToken();
    console.debug('[API hydrateSession]', {
      hasToken: Boolean(token),
      tokenPreview: maskToken(token),
    });
    const me = await this.get('/api/autenticacao/eu', token ? {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } : {});
    if (me?.user) {
      localStorage.setItem('operix_user', JSON.stringify(me.user));
      sessionStorage.setItem('operix_user', JSON.stringify(me.user));
    }
    localStorage.setItem('operix_permissions', JSON.stringify(me?.permissions || []));
    sessionStorage.setItem('operix_permissions', JSON.stringify(me?.permissions || []));
    localStorage.setItem('operix_access', JSON.stringify(me?.access || null));
    sessionStorage.setItem('operix_access', JSON.stringify(me?.access || null));
    return me;
  }

  async startGoogleLogin(identityProvider = 'google') {
    const { codeVerifier, codeChallenge } = await this.createPkcePair();
    const state = this.createState();
    const redirectUri = `${window.location.origin}/auth/callback`;

    sessionStorage.setItem('operix_oauth_state', state);
    sessionStorage.setItem('operix_oauth_verifier', codeVerifier);
    sessionStorage.setItem('operix_oauth_redirect_uri', redirectUri);
    sessionStorage.setItem('operix_oauth_provider', identityProvider);

    const authorization = await this.post('/api/autenticacao/autorizar', {
      redirect_uri: redirectUri,
      state,
      code_challenge: codeChallenge,
      identity_provider: identityProvider,
    });

    const authorizationUrl = authorization?.authorization_url || authorization?.authorizationUrl;
    if (!authorizationUrl) {
      throw new Error('URL de autorização não foi retornada pelo backend.');
    }

    window.location.assign(authorizationUrl);
  }

  async finalizeOAuthCallback({ code, state, redirectUri }) {
    const storedState = sessionStorage.getItem('operix_oauth_state');
    const codeVerifier = sessionStorage.getItem('operix_oauth_verifier');

    if (!codeVerifier) {
      throw new Error('Sessão OAuth expirada. Inicie o login novamente.');
    }

    if (!storedState || storedState !== state) {
      throw new Error('O estado do login social não confere. Tente novamente.');
    }

    const session = await this.post('/api/autenticacao/retorno', {
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    this.setSession(session);
    sessionStorage.removeItem('operix_oauth_state');
    sessionStorage.removeItem('operix_oauth_verifier');
    sessionStorage.removeItem('operix_oauth_redirect_uri');
    sessionStorage.removeItem('operix_oauth_provider');
    return session;
  }

  createState() {
    return this.randomString(32);
  }

  async createPkcePair() {
    const codeVerifier = this.randomString(96);
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = this.base64UrlEncode(new Uint8Array(digest));

    return { codeVerifier, codeChallenge };
  }

  randomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (value) => (value % 36).toString(36)).join('');
  }

  base64UrlEncode(bytes) {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
}

export const api = new ApiClient();
export default api;
