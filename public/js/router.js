/* ==========================================================================
   Operix Hub - Roteador SPA
   ========================================================================== */

import api from './api.js';
import { showToast } from './helpers.js';
import { escapeHtml } from './ui.js';

const routes = {
  '/login': { view: 'login', public: true },
  '/auth/callback': { view: 'auth-callback', public: true },
  '/onboarding': { view: 'onboarding', protected: true },
  '/dashboard': { view: 'dashboard', protected: true, label: 'Dashboard', icon: 'layout-dashboard' },
  '/servicos': { view: 'servicos', protected: true, permission: 'operational.services.access', label: 'Serviços', icon: 'wrench' },
  '/ordem-servico': { view: 'ordem-servico', protected: true, permission: 'operational.services.access', label: 'Ordens de Serviço', icon: 'file-text' },
  '/estoque': { view: 'estoque', protected: true, permission: 'inventory.stock.access', label: 'Estoque', icon: 'package' },
  '/usuarios': { view: 'usuarios', protected: true, permission: 'organization.users.access', label: 'Usuários & Níveis', icon: 'users' },
  '/parametros': { view: 'parametros', protected: true, permission: 'operational.status.access', label: 'Parâmetros', icon: 'sliders' },
  '/registros': { view: 'registros', protected: true, label: 'Auditoria', icon: 'database' }
};

class Router {
  constructor() {
    this.currentViewInstance = null;
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('auth:expired', () => {
      showToast('Sessão expirada. Por favor, realize o login novamente.', 'warning');
      this.navigate('/login');
    });
  }

  navigate(path) {
    window.location.hash = `#${path}`;
  }

  getRouteParams() {
    const hash = window.location.hash || '';
    const hasHashRoute = hash.startsWith('#/') && hash.length > 1;
    const rawPath = hasHashRoute ? hash.slice(1) : (window.location.pathname || '/');
    const [pathPart, hashQueryPart = ''] = rawPath.split('?');
    const searchQueryPart = hasHashRoute ? hashQueryPart : (window.location.search || '').replace(/^\?/, '');
    
    const params = {};
    if (searchQueryPart) {
      const searchParams = new URLSearchParams(searchQueryPart);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }
    
    return { path: pathPart, params };
  }

  async handleRouting() {
    const { path, params } = this.getRouteParams();
    
    // Rota padrão se estiver vazia ou for raiz
    if (!path || path === '/') {
      this.navigate('/dashboard');
      return;
    }

    let route = routes[path];
    
    // Tratamento de rota não encontrada
    if (!route) {
      showToast('Página não encontrada.', 'warning');
      this.navigate('/dashboard');
      return;
    }

    const authenticated = api.isAuthenticated();

    // Redireciona para o login se tentar acessar rota protegida deslogado
    if (route.protected && !authenticated) {
      this.navigate('/login');
      return;
    }

    // Se estiver logado e na tela de login, manda para o dashboard
    if (path === '/login' && authenticated) {
      this.navigate('/dashboard');
      return;
    }

    // Verifica onboarding pendente
    if (authenticated && path !== '/onboarding' && path !== '/auth/callback') {
      const user = api.getUser();
      if (user && user.onboarding_required) {
        this.navigate('/onboarding');
        return;
      }
    }

    // Verifica permissão específica da rota
    if (route.permission && !api.hasPermission(route.permission)) {
      showToast('Acesso restrito. Você não possui permissão para ver esta página.', 'error');
      this.navigate('/dashboard');
      return;
    }

    try {
      await this.renderLayout(route, path);
      await this.loadView(route.view, params, Boolean(route.public));
    } catch (error) {
      console.error('Falha ao renderizar a rota:', error);
      showToast('Erro ao carregar a página.', 'error');
    }
  }

  async renderLayout(route, path) {
    const root = document.getElementById('app-root');
    
    if (route.public) {
      // Telas públicas (login, etc) não têm sidebar/header
      if (!root.querySelector('#app-content-public')) {
        root.innerHTML = '<div id="app-content-public"></div>';
      }
      return;
    }

    // Se já estiver no layout autenticado, não re-renderiza a estrutura
    if (root.querySelector('.app-container')) {
      this.updateSidebarActiveItem(path);
      this.updateBreadcrumbs(path);
      return;
    }

    // Renderiza a estrutura monolítica SaaS
    const user = api.getUser() || { name: 'Usuário', email: '' };
    const access = api.getAccess() || {};
    const companyName = access.tenant_name || access.company_name || user.company_name || user.tenant_name || process.env.APP_NAME || 'Operix';
    const userInitials = user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'OP';
    const userRole = user.admin ? 'Administrador' : (user.role_title || 'Membro');

    // Monta menu da sidebar baseado em permissões
    let menuHtml = '';
    for (const [routePath, routeInfo] of Object.entries(routes)) {
      if (!routeInfo.label) continue;
      
      // Filtra por permissão
      if (routeInfo.permission && !api.hasPermission(routeInfo.permission)) {
        continue;
      }

      menuHtml += `
        <a class="sidebar-item" href="#${routePath}" data-path="${routePath}">
          <i data-lucide="${routeInfo.icon}"></i>
          <span>${routeInfo.label}</span>
        </a>
      `;
    }

    root.innerHTML = `
      <div class="app-container">
        <!-- Sidebar -->
        <aside class="app-sidebar" id="app-sidebar">
          <div class="sidebar-header">
            <div class="sidebar-brand sidebar-toggle-btn" id="sidebar-toggle-btn-aside">
              <i data-lucide="shield" style="color: var(--primary);"></i>
              <span>${escapeHtml(companyName)}</span>
            </div>
          </div>
          <nav class="sidebar-nav">
            ${menuHtml}
          </nav>
          <div class="sidebar-footer">
            <div class="user-avatar">${userInitials}</div>
            <div class="sidebar-footer-info">
              <span class="user-name">${user.name}</span>
              <span class="user-role">${userRole}</span>
            </div>
          </div>
        </aside>

        <!-- Main Panel -->
        <main class="app-main">
          <header class="app-header">
            <div class="header-left">
              <button class="sidebar-toggle-btn" id="sidebar-toggle-btn-header" style="margin-right: 12px;">
                <i data-lucide="menu"></i>
              </button>
              <div class="breadcrumbs" id="app-breadcrumbs">
                <!-- Injetado dinamicamente -->
              </div>
            </div>
            <div class="header-right">
              <div class="user-profile-menu" id="logout-btn" title="Clique para sair">
                <div class="user-avatar">${userInitials}</div>
                <div class="user-details">
                  <span class="user-name">${user.name}</span>
                  <span class="user-role">Sair <i data-lucide="log-out" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i></span>
                </div>
              </div>
            </div>
          </header>
          
          <div class="content-wrapper" id="app-content">
            <!-- As páginas serão injetadas aqui -->
          </div>
        </main>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Eventos de Toggle do Sidebar
    const sidebar = document.getElementById('app-sidebar');
    const toggleAside = document.getElementById('sidebar-toggle-btn-aside');
    const toggleHeader = document.getElementById('sidebar-toggle-btn-header');

    const toggleSidebar = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        sidebar.classList.toggle('open');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    };

    if (toggleAside) toggleAside.addEventListener('click', toggleSidebar);
    if (toggleHeader) toggleHeader.addEventListener('click', toggleSidebar);

    document.querySelectorAll('.sidebar-item').forEach((item) => {
      item.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 768px)').matches) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Evento de Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (await import('./helpers.js').then(({ confirmDialog }) => confirmDialog({
          title: 'Sair do sistema',
          text: 'Deseja realmente encerrar a sessão atual?',
          confirmButtonText: 'Sair',
          icon: 'warning',
        }))) {
          api.logout();
        }
      });
    }

    this.updateSidebarActiveItem(path);
    this.updateBreadcrumbs(path);
  }

  updateSidebarActiveItem(path) {
    const items = document.querySelectorAll('.sidebar-item');
    items.forEach((item) => {
      const itemPath = item.getAttribute('data-path');
      if (itemPath === path) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  updateBreadcrumbs(path) {
    const breadcrumbs = document.getElementById('app-breadcrumbs');
    if (!breadcrumbs) return;

    const routeInfo = routes[path];
    if (!routeInfo) return;

    breadcrumbs.innerHTML = `
      <a href="#/dashboard">Operix</a>
      <span class="separator">/</span>
      <span class="current">${routeInfo.label || 'Início'}</span>
    `;
  }

  async loadView(viewName, params, isPublic = false) {
    const targetElement = document.getElementById(isPublic ? 'app-content-public' : 'app-content');
    if (!targetElement) return;

    // Destrói view anterior se necessário
    if (this.currentViewInstance && typeof this.currentViewInstance.destroy === 'function') {
      this.currentViewInstance.destroy();
    }

    targetElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 200px;">
        <div class="loader-spinner"></div>
      </div>
    `;

    try {
      // Injeta dinamicamente o arquivo da view
      const viewModule = await import(`./views/${viewName}.js`);
      
      // Cria a instância da classe da View e inicia a renderização
      const ViewClass = viewModule.default;
      this.currentViewInstance = new ViewClass(targetElement, params);
      await this.currentViewInstance.render();
      
      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (error) {
      console.error(`Erro ao carregar view ${viewName}:`, error);
      targetElement.innerHTML = `
        <div class="panel" style="text-align: center; padding: 40px; border-color: var(--error);">
          <i data-lucide="alert-circle" style="color: var(--error); width: 48px; height: 48px; margin-bottom: 12px;"></i>
          <h3 style="margin-bottom: 8px;">Erro ao carregar a página</h3>
          <p style="color: var(--text-secondary);">${error.message || 'Houve um problema de conexão ou compilação de scripts.'}</p>
        </div>
      `;
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }
}

export const router = new Router();
export default router;
