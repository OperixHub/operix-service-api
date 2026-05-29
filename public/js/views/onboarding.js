/* ==========================================================================
   Operix Hub - Onboarding View
   ========================================================================== */

import api from '../api.js';
import router from '../router.js';
import { showToast } from '../helpers.js';

export default class OnboardingView {
  constructor(container) {
    this.container = container;
  }

  async render() {
    this.container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card" style="max-width: 500px;">
          <div class="login-header">
            <div class="login-logo">
              <i data-lucide="building-2"></i>
              <span>Configuração da Empresa</span>
            </div>
            <p class="login-subtitle">Preencha as informações abaixo para inicializar sua conta empresarial.</p>
          </div>
          
          <form id="onboarding-form">
            <div class="form-group">
              <label class="form-label" for="company_name">Nome da Empresa / Fantasia *</label>
              <input type="text" id="company_name" class="form-control" placeholder="ex: Operix Corp" required>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="cnpj">CNPJ (Opcional)</label>
              <input type="text" id="cnpj" class="form-control" placeholder="ex: 00.000.000/0001-00">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="description">Descrição da Empresa</label>
              <textarea id="description" class="form-control" placeholder="Descreva brevemente sua atuação (serviços prestados, foco, etc)" rows="3"></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;" id="onboarding-submit-btn">
              <span>Finalizar Configuração</span>
            </button>
          </form>
        </div>
      </div>
    `;

    const form = document.getElementById('onboarding-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const companyNameInput = document.getElementById('company_name');
    const cnpjInput = document.getElementById('cnpj');
    const descriptionInput = document.getElementById('description');
    const submitBtn = document.getElementById('onboarding-submit-btn');
    
    const company_name = companyNameInput.value.trim();
    const cnpj = cnpjInput.value.trim() || null;
    const description = descriptionInput.value.trim() || null;

    if (!company_name) {
      showToast('O nome da empresa é obrigatório.', 'warning');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loader-spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block;"></span> Inicializando...';

    try {
      // Chama o endpoint de onboarding do backend
      await api.post('/api/autenticacao/onboarding', {
        company_name,
        cnpj,
        description
      });
      
      showToast('Empresa configurada com sucesso!', 'success');

      // Atualiza a sessão chamando a rota `/eu` do backend
      const me = await api.get('/api/autenticacao/eu');
      localStorage.setItem('operix_user', JSON.stringify(me.user));
      sessionStorage.setItem('operix_user', JSON.stringify(me.user));
      localStorage.setItem('operix_permissions', JSON.stringify(me.permissions || []));
      sessionStorage.setItem('operix_permissions', JSON.stringify(me.permissions || []));
      localStorage.setItem('operix_access', JSON.stringify(me.access || null));
      sessionStorage.setItem('operix_access', JSON.stringify(me.access || null));

      // Recarrega o layout SPA inteiro removendo a classe do container
      const root = document.getElementById('app-root');
      root.innerHTML = ''; 

      // Manda para o dashboard
      router.navigate('/dashboard');
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Finalizar Configuração</span>';
      showToast(err.message || 'Erro ao configurar locatário.', 'error');
    }
  }

  destroy() {}
}
