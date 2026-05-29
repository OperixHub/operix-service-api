/* ==========================================================================
   Operix Hub - Registros de Auditoria View
   ========================================================================== */

import api from '../api.js';
import { showToast, formatDate } from '../helpers.js';
import { renderPageHeader, renderTableEmptyRow, renderTablePanel } from '../ui.js';

export default class RegistrosView {
  constructor(container) {
    this.container = container;
    this.logs = [];
    this.currentPage = 1;
    this.limit = 20;
    this.total = 0;
  }

  async render() {
    this.container.innerHTML = `
      ${renderPageHeader({
        title: 'Registros de Auditoria',
        description: 'Histórico completo das requisições HTTP e operações realizadas no sistema.',
      })}

      <div class="panel">
        ${renderTablePanel({
          tableId: 'logs',
          loadingColumns: 6,
          loadingMessage: 'Carregando registros...',
          headersHtml: `
            <tr>
              <th>Método</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Tempo Resposta</th>
              <th>Data / Hora</th>
              <th>Detalhes</th>
            </tr>
          `,
          footerHtml: `
            <div class="pagination-container">
              <span class="pagination-info" id="logs-pagination-info">Mostrando 0 de 0 logs</span>
              <div class="pagination-buttons">
                <button class="btn btn-secondary btn-sm" id="btn-prev-page" disabled>Anterior</button>
                <button class="btn btn-secondary btn-sm" id="btn-next-page" disabled>Próxima</button>
              </div>
            </div>
          `,
          wrapInPanel: false,
        })}
      </div>
    `;

    document.getElementById('btn-prev-page').addEventListener('click', () => this.changePage(-1));
    document.getElementById('btn-next-page').addEventListener('click', () => this.changePage(1));

    await this.fetchLogs();
  }

  async fetchLogs() {
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;

    try {
      const response = await api.get(`/api/registros?page=${this.currentPage}&limit=${this.limit}`);
      
      // O endpoint de logs retorna { data: [], total: x }
      this.logs = response?.data || [];
      this.total = response?.total || 0;

      this.renderTable();
      this.updatePaginationControls();

    } catch (e) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--error); padding: 20px;">
            ${e.message || 'Erro ao carregar registros de auditoria.'}
          </td>
        </tr>
      `;
    }
  }

  renderTable() {
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;

    if (this.logs.length === 0) {
      tbody.innerHTML = renderTableEmptyRow({ columns: 6, message: 'Nenhum registro de auditoria encontrado.' });
      return;
    }

    tbody.innerHTML = this.logs.map(log => {
      // Badge de status
      const status = log.status || 200;
      let badgeClass = 'badge-muted';
      if (status >= 200 && status < 300) badgeClass = 'badge-success';
      else if (status >= 300 && status < 400) badgeClass = 'badge-primary';
      else if (status >= 400 && status < 500) badgeClass = 'badge-warning';
      else if (status >= 500) badgeClass = 'badge-danger';

      // Cor do método HTTP
      const method = log.method || 'GET';
      let methodColor = 'var(--text-muted)';
      if (method === 'POST') methodColor = 'var(--success)';
      else if (method === 'PUT' || method === 'PATCH') methodColor = 'var(--warning)';
      else if (method === 'DELETE') methodColor = 'var(--error)';

      return `
        <tr>
          <td><strong style="color: ${methodColor}; font-size: 0.8rem;">${method}</strong></td>
          <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-primary);">${log.url}</td>
          <td><span class="badge ${badgeClass}">${status}</span></td>
          <td>${log.response_time_ms ? `${log.response_time_ms} ms` : '-'}</td>
          <td>${formatDate(log.created_at || log.createdAt)}</td>
          <td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 250px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${log.message || ''}">
            ${log.message || '-'}
          </td>
        </tr>
      `;
    }).join('');
  }

  updatePaginationControls() {
    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    const infoText = document.getElementById('logs-pagination-info');

    if (!prevBtn || !nextBtn || !infoText) return;

    const totalPages = Math.ceil(this.total / this.limit);
    
    prevBtn.disabled = this.currentPage <= 1;
    nextBtn.disabled = this.currentPage >= totalPages;

    const from = this.total === 0 ? 0 : (this.currentPage - 1) * this.limit + 1;
    const to = Math.min(this.currentPage * this.limit, this.total);

    infoText.textContent = `Mostrando ${from} a ${to} de ${this.total} logs (Página ${this.currentPage} de ${totalPages || 1})`;
  }

  async changePage(offset) {
    this.currentPage += offset;
    await this.fetchLogs();
  }

  destroy() {}
}
