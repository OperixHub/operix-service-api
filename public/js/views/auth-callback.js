/* ==========================================================================
   Operix Hub - Callback OAuth / Google
   ========================================================================== */

import api from '../api.js';
import router from '../router.js';
import { showToast } from '../helpers.js';

export default class AuthCallbackView {
  constructor(container) {
    this.container = container;
    this.isProcessing = false;
  }

  async render() {
    this.container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card" style="max-width: 520px;">
          <div class="login-header">
            <div class="login-logo">
              <i data-lucide="shield-check"></i>
              <span>Autenticando sessão</span>
            </div>
            <p class="login-subtitle">Concluindo o login social com segurança.</p>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 18px 0 8px;">
            <div class="loader-spinner" style="width: 36px; height: 36px; border-width: 3px;"></div>
            <p id="callback-message" style="margin: 0; color: var(--text-secondary); text-align: center;">
              Validando retorno do provedor de identidade...
            </p>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    await this.handleCallback();
  }

  async handleCallback() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    const code = params.get('code');
    const state = params.get('state');
    const redirectUri = `${window.location.origin}/auth/callback`;

    try {
      if (error) {
        const isExpired = error === 'temporarily_unavailable' && errorDescription === 'authentication_expired';
        if (isExpired) {
          throw new Error('A sessão do login com Google expirou. Tente novamente.');
        }

        throw new Error(errorDescription || error || 'O login social foi cancelado pelo provedor.');
      }

      if (!code || !state) {
        if (api.isAuthenticated()) {
          window.history.replaceState({}, '', '/');
          router.navigate(api.getUser()?.onboarding_required ? '/onboarding' : '/dashboard');
          return;
        }

        throw new Error('Retorno OAuth inválido. Faça login novamente.');
      }

      const callbackMessage = document.getElementById('callback-message');
      if (callbackMessage) {
        callbackMessage.textContent = 'Trocando código por sessão autenticada...';
      }

      const session = await api.finalizeOAuthCallback({ code, state, redirectUri });
      const user = api.getUser() || session?.user || null;
      showToast('Login com Google realizado com sucesso!', 'success');
      const targetPath = user?.onboarding_required ? '/#/onboarding' : '/#/dashboard';
      setTimeout(() => window.location.replace(targetPath), 150);
    } catch (err) {
      console.error('Falha no callback OAuth:', err);
      api.clearSession();
      sessionStorage.removeItem('operix_oauth_state');
      sessionStorage.removeItem('operix_oauth_verifier');
      sessionStorage.removeItem('operix_oauth_redirect_uri');
      sessionStorage.removeItem('operix_oauth_provider');
      showToast(err.message || 'Não foi possível concluir o login com Google.', 'error');
      router.navigate('/login');
    }
  }

  destroy() {}
}
