/* ==========================================================================
   Operix Hub - Dashboard View
   ========================================================================== */

import api from '../api.js';
import { formatCurrency, showToast } from '../helpers.js';
import { renderPageHeader, renderTableEmptyRow, renderTablePanel } from '../ui.js';

export default class DashboardView {
  constructor(container) {
    this.container = container;
  }

  async render() {
    this.container.innerHTML = `
      ${renderPageHeader({
        title: 'Dashboard',
        description: 'Visão consolidada de serviços, estoque e alertas operacionais.',
      })}

      <!-- KPI Grid -->
      <div class="dashboard-grid" id="kpi-grid">
        <div class="card">
          <div class="card-header-simple">
            <span class="card-title-simple">Total de Serviços</span>
            <div class="card-icon"><i data-lucide="wrench"></i></div>
          </div>
          <div class="card-value" id="kpi-total-services">-</div>
          <div class="card-desc">Serviços registrados na unidade</div>
        </div>

        <div class="card">
          <div class="card-header-simple">
            <span class="card-title-simple">Serviços Pendentes</span>
            <div class="card-icon" style="color: var(--warning); background-color: var(--warning-translucent);"><i data-lucide="clock"></i></div>
          </div>
          <div class="card-value" id="kpi-pending-services">-</div>
          <div class="card-desc">Aguardando atendimento</div>
        </div>

        <div class="card">
          <div class="card-header-simple">
            <span class="card-title-simple">Faturamento Estimado</span>
            <div class="card-icon" style="color: var(--success); background-color: var(--success-translucent);"><i data-lucide="dollar-sign"></i></div>
          </div>
          <div class="card-value" id="kpi-total-revenue">-</div>
          <div class="card-desc">Soma de orçamentos fechados</div>
        </div>

        <div class="card">
          <div class="card-header-simple">
            <span class="card-title-simple">Itens em Alerta</span>
            <div class="card-icon" style="color: var(--error); background-color: var(--error-translucent);"><i data-lucide="alert-triangle"></i></div>
          </div>
          <div class="card-value" id="kpi-low-stock">-</div>
          <div class="card-desc">Itens com estoque baixo (<= 5)</div>
        </div>
      </div>

      <!-- Dashboard Sections -->
      <div class="dashboard-section">
        <!-- Serviços Recentes -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Serviços Recentes</h3>
            <a href="#/servicos" class="btn btn-secondary btn-sm">Ver Todos</a>
          </div>
          ${renderTablePanel({
            tableId: 'recent-services',
            loadingColumns: 5,
            loadingMessage: 'Carregando serviços...',
            headersHtml: `
              <tr>
                <th>Cód</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Faturamento</th>
              </tr>
            `,
            wrapInPanel: false,
          })}
        </div>

        <!-- Alertas de Sistema e Notificações -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Alertas e Notificações</h3>
          </div>
          <div id="system-alerts-container" style="display: flex; flex-direction: column; gap: 12px;">
            <p style="color: var(--text-muted); font-size: 0.875rem; text-align: center; padding: 20px;">Carregando alertas...</p>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Carrega dados paralelos
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      // 1. Carrega Serviços para os KPIs e Lista Recente
      let services = [];
      if (api.hasPermission('operational.services.access')) {
        services = await api.get('/api/servicos');
      }

      // 2. Carrega Estoque se tiver permissão
      let stockItems = [];
      if (api.hasPermission('inventory.stock.access')) {
        stockItems = await api.get('/api/estoque');
      }

      // 3. Carrega Alertas de Sistema se tiver permissão
      let systemAlerts = [];
      if (api.hasPermission('notifications.system-info.access')) {
        try {
          systemAlerts = await api.get('/api/informacoes-sistema');
        } catch (e) {
          console.warn('Falha ao carregar informações do sistema:', e);
        }
      }

      this.updateKPIs(services, stockItems);
      this.renderRecentServices(services);
      this.renderSystemAlerts(systemAlerts);

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      showToast(err.message || 'Não foi possível carregar todas as informações do dashboard.', 'warning');
    }
  }

  updateKPIs(services, stockItems) {
    const totalServices = services.length;
    
    // Filtra serviços pendentes
    const pendingServices = services.filter((s) => {
      const status = (s.status_servico || '').toLowerCase();
      return ['pendente', 'pending', 'aguardando', 'aberto', 'novo'].includes(status);
    }).length;

    // Calcula faturamento estimado (soma dos valores)
    const totalRevenue = services.reduce((acc, s) => acc + (parseFloat(s.valor_total) || 0), 0);

    // Calcula itens com estoque baixo (quantity <= 5)
    const lowStockItems = stockItems.filter((i) => i.quantity <= 5).length;

    document.getElementById('kpi-total-services').textContent = totalServices;
    document.getElementById('kpi-pending-services').textContent = pendingServices;
    document.getElementById('kpi-total-revenue').textContent = formatCurrency(totalRevenue);
    
    const lowStockEl = document.getElementById('kpi-low-stock');
    lowStockEl.textContent = lowStockItems;
    if (lowStockItems > 0) {
      lowStockEl.style.color = 'var(--error)';
    } else {
      lowStockEl.style.color = 'var(--text-primary)';
    }
  }

  renderRecentServices(services) {
    const tbody = document.getElementById('recent-services-tbody');
    if (!tbody) return;

    if (services.length === 0) {
      tbody.innerHTML = renderTableEmptyRow({ columns: 5, message: 'Nenhum serviço cadastrado.' });
      return;
    }

    // Ordena por data decrescente e pega os top 5
    const recent = [...services]
      .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
      .slice(0, 5);

    tbody.innerHTML = recent.map((s) => {
      // Formata status
      const statusNormalized = (s.status_servico || '').toLowerCase();
      let badgeClass = 'badge-muted';
      if (['concluído', 'concluido', 'finalizado'].includes(statusNormalized)) badgeClass = 'badge-success';
      else if (['pendente', 'aguardando', 'aberto'].includes(statusNormalized)) badgeClass = 'badge-warning';
      else if (['cancelado'].includes(statusNormalized)) badgeClass = 'badge-danger';

      return `
        <tr>
          <td><strong style="color: var(--primary);">${s.cod_servico}</strong></td>
          <td>${s.nome_cliente || '-'}</td>
          <td>${s.tipo_servico || '-'}</td>
          <td><span class="badge ${badgeClass}">${s.status_servico || 'Pendente'}</span></td>
          <td><strong>${formatCurrency(s.valor_total || 0)}</strong></td>
        </tr>
      `;
    }).join('');
  }

  renderSystemAlerts(alerts) {
    const container = document.getElementById('system-alerts-container');
    if (!container) return;

    if (!api.hasPermission('notifications.system-info.access')) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 18px;">
          <h4 class="empty-state__title">Sem permissão</h4>
          <p class="empty-state__description">Você não possui acesso para exibir alertas do sistema.</p>
        </div>
      `;
      return;
    }

    if (alerts.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 18px;">
          <div class="empty-state__icon"><i data-lucide="check-circle"></i></div>
          <h4 class="empty-state__title">Nenhum alerta crítico</h4>
          <p class="empty-state__description">Não há pendências operacionais no momento.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = alerts.map((alert) => {
      return `
        <div style="display: flex; gap: 12px; background-color: var(--error-translucent); border: 1px solid var(--error); padding: 12px; border-radius: var(--border-radius);">
          <i data-lucide="alert-triangle" style="color: var(--error); width: 20px; height: 20px; flex-shrink: 0;"></i>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.875rem; font-weight: 600;">Serviço travado ou atrasado</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
              O serviço <strong>${alert.cod_servico}</strong> (Cliente: ${alert.nome_cliente || '-'}) foi criado há mais de 90 dias e continua pendente.
            </span>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  destroy() {}
}
