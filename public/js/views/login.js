/* ==========================================================================
   Operix Hub - Login View
   ========================================================================== */

import api from '../api.js';
import router from '../router.js';
import { showToast } from '../helpers.js';

export default class LoginView {
  constructor(container) {
    this.container = container;
  }

  async render() {
    this.container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">
              <i data-lucide="shield"></i>
              <span>${process.env.APP_NAME}</span>
            </div>
            <p class="login-subtitle">Entre com as suas credenciais de acesso</p>
          </div>
          
          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="username">Usuário</label>
              <input type="text" id="username" class="form-control" placeholder="ex: admin" required autocomplete="username">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="password">Senha</label>
              <input type="password" id="password" class="form-control" placeholder="Sua senha secreta" required autocomplete="current-password">
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;" id="login-submit-btn">
              <span>Entrar</span>
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
            <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
            <span style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;">ou</span>
            <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
          </div>

          <button type="button" class="btn btn-secondary" id="google-login-btn" style="width: 100%;">
            <i data-lucide="chrome"></i>
            <span>Entrar com Google</span>
          </button>
        </div>
      </div>
    `;

    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));

    const googleBtn = document.getElementById('google-login-btn');
    googleBtn.addEventListener('click', (e) => this.handleGoogleLogin(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('login-submit-btn');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showToast('Por favor, preencha todos os campos.', 'warning');
      return;
    }

    // Estado de Carregamento
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loader-spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block;"></span> Autenticando...';

    try {
      await api.login(username, password);
      showToast('Login realizado com sucesso!', 'success');
      
      const user = api.getUser();
      if (user && user.onboarding_required) {
        router.navigate('/onboarding');
      } else {
        router.navigate('/dashboard');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Entrar</span>';
      showToast(err.message || 'Erro ao realizar login.', 'error');
    }
  }

  async handleGoogleLogin() {
    const googleBtn = document.getElementById('google-login-btn');
    const submitBtn = document.getElementById('login-submit-btn');

    googleBtn.disabled = true;
    submitBtn.disabled = true;
    googleBtn.innerHTML = '<span class="loader-spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block;"></span> Redirecionando...';

    try {
      await api.startGoogleLogin('google');
    } catch (err) {
      googleBtn.disabled = false;
      submitBtn.disabled = false;
      googleBtn.innerHTML = '<i data-lucide="chrome"></i><span>Entrar com Google</span>';
      if (window.lucide) {
        window.lucide.createIcons();
      }
      showToast(err.message || 'Não foi possível iniciar o login com Google.', 'error');
    }
  }

  destroy() {
    // Cleanup de listeners se necessário
  }
}
