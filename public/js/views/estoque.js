/* ==========================================================================
   Operix Hub - Controle de Estoque View
   ========================================================================== */

import api from '../api.js';
import { confirmDialog, showToast, createAsyncFormModal, formatCurrency } from '../helpers.js';
import { renderPageHeader, renderTableEmptyRow, renderTablePanel, renderFormGroup, renderFormRow } from '../ui.js';

export default class EstoqueView {
  constructor(container) {
    this.container = container;
    this.items = [];
    this.searchQuery = '';
  }

  async render() {
    this.container.innerHTML = `
      ${renderPageHeader({
        title: 'Controle de Estoque',
        description: 'Controle e movimentação de peças, insumos e equipamentos em estoque.',
        actions: `
          <button class="btn btn-primary" id="btn-new-stock">
            <i data-lucide="plus"></i> Novo Item
          </button>
        `,
      })}

      <!-- Banner de Alerta para Estoque Baixo -->
      <div id="low-stock-alert-container"></div>

      <div class="table-actions">
        <div class="search-box">
          <i data-lucide="search"></i>
          <input type="text" id="stock-search" placeholder="Buscar por nome ou código..." value="${this.searchQuery}">
        </div>
      </div>

      <div style="margin-top: 16px;">
        ${renderTablePanel({
          tableId: 'stock',
          loadingColumns: 7,
          loadingMessage: 'Carregando estoque...',
          headersHtml: `
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Qtd em Estoque</th>
              <th>Preço de Compra</th>
              <th>Preço de Venda</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          `,
        })}
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    document.getElementById('btn-new-stock').addEventListener('click', () => this.handleNewItem());
    
    document.getElementById('stock-search').addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      this.filterAndRenderTable();
    });

    await this.fetchStock();
  }

  async fetchStock() {
    try {
      this.items = await api.get('/api/estoque');
      this.filterAndRenderTable();
    } catch (e) {
      document.getElementById('stock-tbody').innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--error); padding: 20px;">
            ${e.message || 'Erro ao carregar estoque.'}
          </td>
        </tr>
      `;
    }
  }

  filterAndRenderTable() {
    const tbody = document.getElementById('stock-tbody');
    const alertContainer = document.getElementById('low-stock-alert-container');
    if (!tbody || !alertContainer) return;

    // Filtra dados localmente
    const filtered = this.items.filter(i => 
      (i.name && i.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (i.code && i.code.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );

    // Identifica itens com estoque crítico (quantidade <= 5)
    const lowStockItems = this.items.filter(i => i.quantity <= 5);
    
    if (lowStockItems.length > 0) {
      alertContainer.innerHTML = `
        <div class="alert-low-stock">
          <i data-lucide="alert-triangle"></i>
          <span>Existem <strong>${lowStockItems.length}</strong> itens com estoque crítico (menos de 5 unidades). Favor providenciar reposição!</span>
        </div>
      `;
    } else {
      alertContainer.innerHTML = '';
    }

    if (filtered.length === 0) {
      tbody.innerHTML = renderTableEmptyRow({ columns: 7, message: 'Nenhum item em estoque corresponde à busca.' });
      return;
    }

    tbody.innerHTML = filtered.map(i => {
      const isCritical = i.quantity <= 5;
      const qtyStyle = isCritical ? 'color: var(--error); font-weight: 700;' : 'font-weight: 600;';
      const warningIcon = isCritical ? '<i data-lucide="alert-triangle" style="width: 14px; height: 14px; color: var(--error); vertical-align: middle; margin-right: 4px;"></i>' : '';

      return `
        <tr>
          <td><strong style="color: var(--primary);">${i.code}</strong></td>
          <td><strong>${i.name}</strong></td>
          <td style="color: var(--text-secondary); max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
            ${i.description || '-'}
          </td>
          <td style="${qtyStyle}">
            ${warningIcon}${i.quantity} unidades
          </td>
          <td>${formatCurrency(i.purchasePrice || 0)}</td>
          <td>${formatCurrency(i.salePrice || 0)}</td>
          <td style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm edit-stock-btn" data-id="${i.id}">
              <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-stock-btn" data-id="${i.id}" data-name="${i.name}">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.registerEvents();
  }

  registerEvents() {
    // 1. Edição de Item
    document.querySelectorAll('.edit-stock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = this.items.find(i => String(i.id) === id);
        if (item) this.handleEditItem(item);
      });
    });

    // 2. Exclusão de Item
    document.querySelectorAll('.delete-stock-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        
        const approved = await confirmDialog({
          title: 'Excluir item do estoque',
          text: `Tem certeza de que deseja excluir o item "${name}" do estoque?`,
          confirmButtonText: 'Excluir',
          icon: 'warning',
        });

        if (approved) {
          try {
            await api.delete(`/api/estoque/${id}`);
            showToast('Item de estoque excluído.', 'success');
            await this.fetchStock();
          } catch (err) {
            showToast(err.message || 'Erro ao remover item.', 'error');
          }
        }
      });
    });
  }

  handleNewItem() {
    const bodyHtml = `
      <form id="new-stock-form">
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Código do Item *',
            controlHtml: '<input type="text" id="stock-code" class="form-control" placeholder="ex: CAB-HD-01" required>',
          })}
          ${renderFormGroup({
            label: 'Nome do Item *',
            controlHtml: '<input type="text" id="stock-name" class="form-control" placeholder="ex: Cabo HDMI 3m" required>',
          })}
        `)}
        ${renderFormGroup({
          label: 'Descrição',
          controlHtml: '<textarea id="stock-desc" class="form-control" rows="2" placeholder="Informações adicionais do item"></textarea>',
        })}
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Quantidade em Estoque *',
            controlHtml: '<input type="number" id="stock-qty" step="1" class="form-control" value="0" required>',
          })}
        `)}
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Preço de Compra (R$) *',
            controlHtml: '<input type="number" id="stock-p-price" step="0.01" class="form-control" value="0.00" required>',
          })}
          ${renderFormGroup({
            label: 'Preço de Venda (R$) *',
            controlHtml: '<input type="number" id="stock-s-price" step="0.01" class="form-control" value="0.00" required>',
          })}
        `)}
      </form>
    `;

    createAsyncFormModal({
      title: 'Cadastrar Item no Estoque',
      bodyHtml,
      confirmText: 'Salvar Item',
      onSubmit: async () => {
        const code = document.getElementById('stock-code').value.trim();
        const name = document.getElementById('stock-name').value.trim();
        const description = document.getElementById('stock-desc').value.trim() || null;
        const quantity = parseInt(document.getElementById('stock-qty').value);
        const purchasePrice = parseFloat(document.getElementById('stock-p-price').value);
        const salePrice = parseFloat(document.getElementById('stock-s-price').value);

        if (!code || !name || isNaN(quantity) || isNaN(purchasePrice) || isNaN(salePrice)) {
          throw new Error('Todos os campos obrigatórios (*) devem ser preenchidos corretamente.');
        }

        await api.post('/api/estoque', {
          code,
          name,
          description,
          quantity,
          purchasePrice,
          salePrice
        });
        await this.fetchStock();
      },
      successMessage: 'Item de estoque criado com sucesso!',
    });
  }

  handleEditItem(item) {
    const bodyHtml = `
      <form id="edit-stock-form">
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Código do Item *',
            controlHtml: `<input type="text" id="edit-stock-code" class="form-control" value="${item.code || ''}" required>`,
          })}
          ${renderFormGroup({
            label: 'Nome do Item *',
            controlHtml: `<input type="text" id="edit-stock-name" class="form-control" value="${item.name || ''}" required>`,
          })}
        `)}
        ${renderFormGroup({
          label: 'Descrição',
          controlHtml: `<textarea id="edit-stock-desc" class="form-control" rows="2">${item.description || ''}</textarea>`,
        })}
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Quantidade em Estoque *',
            controlHtml: `<input type="number" id="edit-stock-qty" step="1" class="form-control" value="${item.quantity}" required>`,
          })}
        `)}
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Preço de Compra (R$) *',
            controlHtml: `<input type="number" id="edit-stock-p-price" step="0.01" class="form-control" value="${item.purchasePrice || 0}" required>`,
          })}
          ${renderFormGroup({
            label: 'Preço de Venda (R$) *',
            controlHtml: `<input type="number" id="edit-stock-s-price" step="0.01" class="form-control" value="${item.salePrice || 0}" required>`,
          })}
        `)}
      </form>
    `;

    createAsyncFormModal({
      title: `Editar Item - ${item.code}`,
      bodyHtml,
      confirmText: 'Salvar Alterações',
      onSubmit: async () => {
        const code = document.getElementById('edit-stock-code').value.trim();
        const name = document.getElementById('edit-stock-name').value.trim();
        const description = document.getElementById('edit-stock-desc').value.trim() || null;
        const quantity = parseInt(document.getElementById('edit-stock-qty').value);
        const purchasePrice = parseFloat(document.getElementById('edit-stock-p-price').value);
        const salePrice = parseFloat(document.getElementById('edit-stock-s-price').value);

        if (!code || !name || isNaN(quantity) || isNaN(purchasePrice) || isNaN(salePrice)) {
          throw new Error('Todos os campos obrigatórios devem ser válidos.');
        }

        await api.put(`/api/estoque/${item.id}`, {
          code,
          name,
          description,
          quantity,
          purchasePrice,
          salePrice
        });
        await this.fetchStock();
      },
      successMessage: 'Item de estoque atualizado.',
    });
  }

  destroy() {}
}
