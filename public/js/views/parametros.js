/* ==========================================================================
   Operix Hub - Configuração de Parâmetros View
   ========================================================================== */

import api from '../api.js';
import { confirmDialog, showToast, createAsyncFormModal } from '../helpers.js';
import { renderPageHeader, renderTableEmptyRow, renderTablePanel, renderFormGroup, renderFormRow } from '../ui.js';

export default class ParametrosView {
  constructor(container) {
    this.container = container;
    this.serviceStatuses = [];
    this.paymentStatuses = [];
    this.productTypes = [];
  }

  async render() {
    this.container.innerHTML = `
      ${renderPageHeader({
        title: 'Parâmetros Globais',
        description: 'Configure status de serviço, status de pagamento e tipos de produtos cadastráveis.',
      })}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        
        <!-- Status de Serviço -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Status de Serviço</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-status-service">
              <i data-lucide="plus"></i> Adicionar
            </button>
          </div>
          ${renderTablePanel({
            tableId: 'status-service',
            loadingColumns: 2,
            loadingMessage: 'Carregando...',
            headersHtml: `
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            `,
            wrapInPanel: false,
          })}
        </div>

        <!-- Status de Pagamento -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Status de Pagamento</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-status-payment">
              <i data-lucide="plus"></i> Adicionar
            </button>
          </div>
          ${renderTablePanel({
            tableId: 'status-payment',
            loadingColumns: 2,
            loadingMessage: 'Carregando...',
            headersHtml: `
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            `,
            wrapInPanel: false,
          })}
        </div>

        <!-- Tipos de Produto -->
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">Tipos de Produto</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-type-product">
              <i data-lucide="plus"></i> Adicionar
            </button>
          </div>
          ${renderTablePanel({
            tableId: 'type-product',
            loadingColumns: 2,
            loadingMessage: 'Carregando...',
            headersHtml: `
              <tr>
                <th>Nome</th>
                <th style="text-align: right;">Ações</th>
              </tr>
            `,
            wrapInPanel: false,
          })}
        </div>

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Registra clicks de inserção
    document.getElementById('btn-add-status-service').addEventListener('click', () => this.handleAddItem('service'));
    document.getElementById('btn-add-status-payment').addEventListener('click', () => this.handleAddItem('payment'));
    document.getElementById('btn-add-type-product').addEventListener('click', () => this.handleAddItem('product'));

    // Carrega dados iniciais
    await this.fetchData();
  }

  async fetchData() {
    try {
      const [serviceS, paymentS, productT] = await Promise.all([
        api.get('/api/status-servico'),
        api.get('/api/status-pagamento'),
        api.get('/api/tipos-produto')
      ]);

      this.serviceStatuses = serviceS;
      this.paymentStatuses = paymentS;
      this.productTypes = productT;

      this.renderList('service', this.serviceStatuses, 'status-service-tbody');
      this.renderList('payment', this.paymentStatuses, 'status-payment-tbody');
      this.renderList('product', this.productTypes, 'type-product-tbody');

    } catch (e) {
      showToast(e.message || 'Falha ao carregar parâmetros.', 'error');
    }
  }

  renderList(type, list, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = renderTableEmptyRow({ columns: type === 'product' ? 2 : 3, message: 'Nenhum registro cadastrado.' });
      return;
    }

    tbody.innerHTML = list.map(item => {
      if (type === 'product') {
        return `
          <tr>
            <td><strong>${item.name}</strong></td>
            <td style="text-align: right;">
              <button class="btn btn-danger btn-sm delete-param-btn" data-id="${item.id}" data-type="${type}" data-name="${item.name}">
                <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
              </button>
            </td>
          </tr>
        `;
      }

      return `
        <tr>
          <td><strong>${item.cod ?? '-'}</strong></td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <strong>${item.description || '-'}</strong>
              ${item.color ? `<span class="badge badge-muted" style="width: fit-content;">${item.color}</span>` : ''}
            </div>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-danger btn-sm delete-param-btn" data-id="${item.id}" data-type="${type}" data-name="${item.description || item.cod || ''}">
              <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Registra botões de deletar
    tbody.querySelectorAll('.delete-param-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const paramType = e.currentTarget.getAttribute('data-type');
        const name = e.currentTarget.getAttribute('data-name');

        const approved = await confirmDialog({
          title: 'Remover parâmetro',
          text: `Tem certeza de que deseja remover "${name}"?`,
          confirmButtonText: 'Remover',
          icon: 'warning',
        });

        if (approved) {
          try {
            let endpoint = '';
            if (paramType === 'service') endpoint = `/api/status-servico/${id}`;
            else if (paramType === 'payment') endpoint = `/api/status-pagamento/${id}`;
            else if (paramType === 'product') endpoint = `/api/tipos-produto/${id}`;

            await api.delete(endpoint);
            showToast('Parâmetro removido.', 'success');
            await this.fetchData();
          } catch (err) {
            showToast(err.message || 'Erro ao remover parâmetro.', 'error');
          }
        }
      });
    });
  }

  handleAddItem(type) {
    let title = '';
    let placeholder = '';
    let endpoint = '';

    if (type === 'service') {
      title = 'Adicionar Status de Serviço';
      placeholder = 'ex: Em Andamento';
      endpoint = '/api/status-servico';
    } else if (type === 'payment') {
      title = 'Adicionar Status de Pagamento';
      placeholder = 'ex: Faturado';
      endpoint = '/api/status-pagamento';
    } else if (type === 'product') {
      title = 'Adicionar Tipo de Produto';
      placeholder = 'ex: Placa Gráfica';
      endpoint = '/api/tipos-produto';
    }

    const bodyHtml = `
      <form id="new-param-form">
        ${type === 'product' ? renderFormGroup({
          label: 'Nome *',
          controlHtml: `<input type="text" id="param-name" class="form-control" placeholder="${placeholder}" required>`,
        }) : renderFormRow(`
          ${renderFormGroup({
            label: 'Código *',
            controlHtml: '<input type="number" id="param-code" class="form-control" placeholder="ex: 1" required>',
          })}
          ${renderFormGroup({
            label: 'Descrição *',
            controlHtml: `<input type="text" id="param-desc" class="form-control" placeholder="${placeholder}" required>`,
          })}
        `)}
        ${type === 'product' ? renderFormGroup({
          label: 'Descrição (Opcional)',
          controlHtml: '<input type="text" id="param-desc" class="form-control" placeholder="Notas sobre este item">',
        }) : renderFormGroup({
          label: 'Cor (Opcional)',
          controlHtml: '<input type="text" id="param-color" class="form-control" placeholder="ex: #3B82F6 ou azul">',
        })}
      </form>
    `;

    createAsyncFormModal({
      title,
      bodyHtml,
      confirmText: 'Salvar',
      onSubmit: async () => {
        const isProduct = type === 'product';
        const name = isProduct ? document.getElementById('param-name').value.trim() : null;
        const code = isProduct ? null : Number(document.getElementById('param-code').value);
        const description = isProduct
          ? document.getElementById('param-desc').value.trim() || null
          : document.getElementById('param-desc').value.trim();
        const color = isProduct ? null : document.getElementById('param-color').value.trim() || null;

        if (isProduct) {
          if (!name) {
            throw new Error('O nome é obrigatório.');
          }
        } else if (!Number.isFinite(code) || !description) {
          throw new Error('Código e descrição são obrigatórios.');
        }

        const payload = isProduct ? { name, description } : { cod: code, description, color };
        await api.post(endpoint, payload);
        await this.fetchData();
      },
      successMessage: 'Parâmetro adicionado com sucesso!',
    });
  }

  destroy() {}
}
