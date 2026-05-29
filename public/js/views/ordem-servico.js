/* ==========================================================================
   Operix Hub - Ordens de Serviço View
   ========================================================================== */

import api from '../api.js';
import router from '../router.js';
import { confirmDialog, showToast, createAsyncFormModal, formatCurrency, formatDate } from '../helpers.js';
import { escapeHtml, renderActionCell, renderPageHeader, renderTableEmptyRow, renderTablePanel, renderFormGroup } from '../ui.js';

export default class OrdemServicoView {
  constructor(container, params = {}) {
    this.container = container;
    this.params = params; // params.cod contêm o código se visualizando detalhes
    this.orders = [];
  }

  async render() {
    if (this.params.cod) {
      await this.renderDetails(this.params.cod);
    } else {
      await this.renderList();
    }
  }

  // --- RENDERIZAR LISTA DE ORDENS ---
  async renderList() {
    this.container.innerHTML = `
      ${renderPageHeader({
        title: 'Ordens de Serviço (OS)',
        description: 'Controle financeiro, orçamentos e detalhes faturados por ordem.',
      })}

      ${renderTablePanel({
        tableId: 'orders',
        loadingColumns: 4,
        loadingMessage: 'Carregando ordens...',
        headersHtml: `
          <tr>
            <th>Código da OS</th>
            <th>Valor Faturado</th>
            <th>Data de Geração</th>
            <th style="text-align: right;">Ações</th>
          </tr>
        `,
      })}
    `;

    try {
      this.orders = await api.get('/api/ordem-servico');
      const tbody = document.getElementById('orders-tbody');
      
      if (this.orders.length === 0) {
        tbody.innerHTML = renderTableEmptyRow({ columns: 4, message: 'Nenhuma ordem de serviço ativa no momento.' });
        return;
      }

      tbody.innerHTML = this.orders.map(o => `
        <tr>
          <td><strong style="color: var(--primary);">${escapeHtml(o.cod_order)}</strong></td>
          <td><strong>${formatCurrency(o.value || 0)}</strong></td>
          <td>${formatDate(o.created_at || o.createdAt, false)}</td>
          ${renderActionCell(`
            <a href="#/ordem-servico?cod=${encodeURIComponent(o.cod_order)}" class="btn btn-secondary btn-sm">
              <i data-lucide="eye" style="width: 14px; height: 14px; display: inline-block;"></i> Detalhes & Orçamento
            </a>
          `)}
        </tr>
      `).join('');

      if (window.lucide) {
        window.lucide.createIcons();
      }

    } catch (e) {
      document.getElementById('orders-tbody').innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--error); padding: 20px;">
            ${e.message || 'Erro ao carregar ordens de serviço.'}
          </td>
        </tr>
      `;
    }
  }

  // --- RENDERIZAR DETALHES DE UMA ORDEM ---
  async renderDetails(cod) {
    this.container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <a href="#/ordem-servico" class="btn btn-secondary btn-sm" style="margin-bottom: 12px;">
          <i data-lucide="arrow-left"></i> Voltar para Lista
        </a>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <h2 style="font-weight: 700; font-size: 1.75rem; letter-spacing: -0.025em; margin-bottom: 4px;">OS: ${cod}</h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem;">Visualize o espelho e edite os itens faturados no orçamento.</p>
          </div>
          <div>
            <button class="btn btn-primary" id="btn-add-estimate-item">
              <i data-lucide="plus"></i> Adicionar Item
            </button>
          </div>
        </div>
      </div>

      <div class="os-details-grid">
        <!-- Detalhes Gerais -->
        <div class="panel">
          <h3 class="panel-title" style="margin-bottom: 14px;">Resumo Faturamento</h3>
          <div class="os-meta-list" id="os-meta-summary">
            <div class="loader-spinner" style="margin: 20px auto;"></div>
          </div>
        </div>

        <!-- Itens do Orçamento -->
        <div class="panel">
          <h3 class="panel-title" style="margin-bottom: 14px;">Itens do Orçamento</h3>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Preço Unitário</th>
                  <th>Total</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody id="os-estimate-tbody">
                <!-- Injetado dinamicamente -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    document.getElementById('btn-add-estimate-item').addEventListener('click', () => this.handleAddEstimateItem(cod));

    await this.fetchOrderDetails(cod);
  }

  async fetchOrderDetails(cod) {
    try {
      const response = await api.get(`/api/ordem-servico/${cod}`);
      
      // O backend retorna um array de objetos, onde o primeiro é a ordem de serviço
      const order = Array.isArray(response) ? response[0] : response;

      if (!order) {
        showToast('Ordem de serviço não encontrada.', 'error');
        router.navigate('/ordem-servico');
        return;
      }

      // Renderiza metadados
      const metaContainer = document.getElementById('os-meta-summary');
      metaContainer.innerHTML = `
        <div class="os-meta-item">
          <span class="os-meta-label">Código da OS</span>
          <span class="os-meta-value" style="color: var(--primary);">${escapeHtml(order.cod_order)}</span>
        </div>
        <div class="os-meta-item">
          <span class="os-meta-label">Total do Orçamento</span>
          <span class="os-meta-value" style="font-size: 1.2rem; color: var(--success);">${formatCurrency(order.value || 0)}</span>
        </div>
        <div class="os-meta-item">
          <span class="os-meta-label">Criado em</span>
          <span class="os-meta-value">${formatDate(order.created_at || order.createdAt)}</span>
        </div>
      `;

      // Renderiza itens
      const tbody = document.getElementById('os-estimate-tbody');
      let estimateItems = [];
      try {
        estimateItems = order.estimate ? JSON.parse(order.estimate) : [];
      } catch (e) {
        console.error('Erro ao fazer parse dos itens de orçamento:', e);
      }

      if (!Array.isArray(estimateItems) || estimateItems.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">
              Nenhum item adicionado ao orçamento desta OS.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = estimateItems.map(item => {
        const qty = parseFloat(item.amount) || 1;
        const price = parseFloat(item.price) || 0;
        const total = qty * price;

        return `
          <tr>
            <td>${escapeHtml(item.description || '-')}</td>
            <td>${qty}</td>
            <td>${formatCurrency(price)}</td>
            <td><strong>${formatCurrency(total)}</strong></td>
            ${renderActionCell(`
              <button class="btn btn-danger btn-sm delete-estimate-item-btn" data-id="${item.id}" title="Remover item">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
              </button>
            `)}
          </tr>
        `;
      }).join('');

      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Registra evento de exclusão
      tbody.querySelectorAll('.delete-estimate-item-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const idEstimate = e.currentTarget.getAttribute('data-id');
          const approved = await confirmDialog({
            title: 'Remover item do orçamento',
            text: 'Deseja realmente remover este item de faturamento?',
            confirmButtonText: 'Remover',
            icon: 'warning',
          });

          if (approved) {
            try {
              await api.delete(`/api/ordem-servico/orcamento/${cod}/${idEstimate}`);
              showToast('Item removido com sucesso.', 'success');
              await this.fetchOrderDetails(cod);
            } catch (err) {
              showToast(err.message || 'Erro ao remover item.', 'error');
            }
          }
        });
      });

    } catch (e) {
      showToast(e.message || 'Erro ao carregar detalhes da OS.', 'error');
    }
  }

  handleAddEstimateItem(cod) {
    const bodyHtml = `
      <form id="add-estimate-form">
        ${renderFormGroup({
          label: 'Tipo de Orçamento *',
          controlHtml: `
            <select id="estimate-type" class="form-control" required>
              <option value="completa">Orçamento Composto (Adiciona aos itens existentes)</option>
              <option value="simples">Orçamento Simplificado (Substitui anteriores)</option>
            </select>
          `,
        })}
        ${renderFormGroup({
          label: 'Descrição do Item *',
          controlHtml: '<input type="text" id="estimate-desc" class="form-control" placeholder="ex: Troca de Placa Mãe" required>',
        })}
        ${renderFormGroup({
          label: 'Preço Unitário (R$) *',
          controlHtml: '<input type="number" id="estimate-price" step="0.01" class="form-control" placeholder="ex: 150.00" required>',
        })}
        <div id="estimate-amount-container">
          ${renderFormGroup({
            label: 'Quantidade *',
            controlHtml: '<input type="number" id="estimate-amount" step="1" class="form-control" value="1" required>',
          })}
        </div>
      </form>
    `;

    createAsyncFormModal({
      title: 'Adicionar Item ao Orçamento',
      bodyHtml,
      confirmText: 'Adicionar',
      onSubmit: async () => {
        const type = document.getElementById('estimate-type').value;
        const description = document.getElementById('estimate-desc').value.trim();
        const price = parseFloat(document.getElementById('estimate-price').value);
        const amount = document.getElementById('estimate-amount').value;

        if (!description || isNaN(price)) {
          throw new Error('Descrição e preço unitário são obrigatórios.');
        }

        const payload = {
          type,
          description,
          price
        };

        if (type !== 'simples') {
          payload.amount = parseInt(amount) || 1;
        } else {
          payload.amount = 1;
        }

        await api.put(`/api/ordem-servico/orcamento/${cod}`, payload);
        await this.fetchOrderDetails(cod);
      },
      successMessage: 'Item adicionado ao orçamento.',
    });

    // Controla visibilidade de quantidade com base no tipo
    const typeSelect = document.getElementById('estimate-type');
    const amountContainer = document.getElementById('estimate-amount-container');
    const amountInput = document.getElementById('estimate-amount');

    typeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'simples') {
        amountContainer.style.display = 'none';
        amountInput.value = '1';
        amountInput.required = false;
      } else {
        amountContainer.style.display = 'flex';
        amountInput.required = true;
      }
    });
  }

  destroy() {}
}
