/* ==========================================================================
   Operix Hub - Serviços & Almoxarifado View
   ========================================================================== */

import api from '../api.js';
import { confirmDialog, enhanceSelects, showToast, createAsyncFormModal, formatDate } from '../helpers.js';
import { escapeHtml, renderActionCell, renderInlineSelect, renderPageHeader, renderTableEmptyRow, renderTablePanel, renderFormGroup, renderFormRow } from '../ui.js';

function buildOptions(list, selectedValue) {
  return list.map((item) => {
    const value = item.name ?? item;
    const selected = value === selectedValue ? 'selected' : '';
    return `<option value="${escapeHtml(value)}" ${selected}>${escapeHtml(value)}</option>`;
  }).join('');
}

function renderWarehouseBadgeButton(service, typeTable) {
  const warehouseText = service.warehouse_status ? 'Entregue' : 'Pendente';
  const warehouseBadge = service.warehouse_status ? 'badge-success' : 'badge-warning';

  return `
    <button class="btn btn-secondary btn-sm toggle-warehouse-btn" data-id="${service.id}" data-value="${service.warehouse_status}" data-type="${typeTable}">
      <span class="badge ${warehouseBadge}">${warehouseText}</span>
    </button>
  `;
}

export default class ServicosView {
  constructor(container) {
    this.container = container;
    this.currentTab = 'geral'; // 'geral' ou 'almoxarifado'
    this.services = [];
    this.statusServicoList = [];
    this.statusPagamentoList = [];
    this.tiposProdutoList = [];
    this.filters = {
      search: '',
      order: '',
      date: '',
      product: '',
      client: '',
      telephone: '',
      adress: '',
      observation: '',
      status: '',
      payment: '',
    };
    this.filtersCollapsed = true;
  }

  async render() {
    this.container.innerHTML = `
      ${renderPageHeader({
        title: 'Serviços & Almoxarifado',
        description: 'Gerenciamento completo das ordens de serviço e estoque do almoxarifado.',
        actions: `
          <button class="btn btn-primary" id="btn-new-service">
            <i data-lucide="plus"></i> Novo Serviço
          </button>
        `,
      })}

      <!-- Tab Navigation -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
        <button class="btn ${this.currentTab === 'geral' ? 'btn-primary' : 'btn-secondary'}" id="tab-geral" style="padding: 8px 16px;">
          Serviços Gerais
        </button>
        <button class="btn ${this.currentTab === 'almoxarifado' ? 'btn-primary' : 'btn-secondary'}" id="tab-almoxarifado" style="padding: 8px 16px;">
          Almoxarifado
        </button>
      </div>

      <!-- Filtros -->
      <div class="panel" style="margin-bottom: 16px;">
        <div class="panel-header" style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 class="panel-title">Filtros</h3>
            <button class="btn btn-secondary btn-sm" id="btn-toggle-filters" title="${this.filtersCollapsed ? 'Expandir' : 'Recolher'} filtros" style="font-size: 18px;">
              <i data-lucide="chevron-${this.filtersCollapsed ? 'down' : 'up'}"></i>
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-clear-filters">
            <i data-lucide="filter-x"></i> Limpar filtros
          </button>
        </div>
        ${this.filtersCollapsed
          ? renderFormRow(`
              ${renderFormGroup({
                label: 'Busca geral',
                controlHtml: '<input type="text" id="filter-search" class="form-control" placeholder="OS, cliente, telefone, produto, endereço ou observação">',
              })}
            `)
          : `
            ${renderFormRow(`
              ${renderFormGroup({
                label: 'Busca geral',
                controlHtml: '<input type="text" id="filter-search" class="form-control" placeholder="OS, cliente, telefone, produto, endereço ou observação">',
              })}
              ${renderFormGroup({
                label: 'Código OS',
                controlHtml: '<input type="text" id="filter-order" class="form-control" placeholder="ex: 123">',
              })}
            `)}
            ${renderFormRow(`
              ${renderFormGroup({
                label: 'Data',
                controlHtml: '<input type="date" id="filter-date" class="form-control">',
              })}
              ${renderFormGroup({
                label: 'Produto',
                controlHtml: '<select id="filter-product" class="form-control"><option value="">Todos os produtos</option></select>',
              })}
            `)}
            ${renderFormRow(`
              ${renderFormGroup({
                label: 'Cliente',
                controlHtml: '<input type="text" id="filter-client" class="form-control" placeholder="Nome do cliente">',
              })}
              ${renderFormGroup({
                label: 'Telefone',
                controlHtml: '<input type="text" id="filter-telephone" class="form-control" placeholder="DDD + número">',
              })}
            `)}
            ${renderFormRow(`
              ${renderFormGroup({
                label: 'Endereço',
                controlHtml: '<input type="text" id="filter-adress" class="form-control" placeholder="Rua, bairro, cidade">',
              })}
              ${renderFormGroup({
                label: 'Observação',
                controlHtml: '<input type="text" id="filter-observation" class="form-control" placeholder="Notas do serviço">',
              })}
            `)}
            ${renderFormRow(`
              ${renderFormGroup({
                label: 'Status',
                controlHtml: '<select id="filter-status" class="form-control"><option value="">Todos os Status</option></select>',
              })}
              ${renderFormGroup({
                label: 'Pagamento',
                controlHtml: '<select id="filter-payment" class="form-control"><option value="">Todos os Pagamentos</option></select>',
              })}
            `)}
          `}
      </div>

      <!-- Tabela -->
      <div style="margin-top: 16px;">
        ${renderTablePanel({
          tableId: 'services',
          loadingColumns: 11,
          loadingMessage: 'Carregando...',
          headersHtml: `
            <tr id="table-headers">
              <!-- Cabeçalhos dinâmicos -->
            </tr>
          `,
          wrapInPanel: true,
        })}
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
    enhanceSelects(this.container);

    // Registra Eventos de Tabs e Filtros
    document.getElementById('tab-geral').addEventListener('click', () => this.switchTab('geral'));
    document.getElementById('tab-almoxarifado').addEventListener('click', () => this.switchTab('almoxarifado'));
    document.getElementById('btn-new-service').addEventListener('click', () => this.handleNewService());
    this.bindFilterEvents();

    // Botão de recolher/expandir filtros
    const btnToggleFilters = document.getElementById('btn-toggle-filters');
    if (btnToggleFilters) {
      btnToggleFilters.addEventListener('click', () => {
        this.filtersCollapsed = !this.filtersCollapsed;
        this.render();
      });
    }

    // Inicia carregamento
    await this.loadInitialData();
  }

  async switchTab(tab) {
    this.currentTab = tab;
    
    const tabGeral = document.getElementById('tab-geral');
    const tabAlmo = document.getElementById('tab-almoxarifado');
    
    if (tab === 'geral') {
      tabGeral.className = 'btn btn-primary';
      tabAlmo.className = 'btn btn-secondary';
    } else {
      tabGeral.className = 'btn btn-secondary';
      tabAlmo.className = 'btn btn-primary';
    }
    
    this.resetFilters();

    await this.fetchServices();
  }

  bindFilterEvents() {
    const filterIds = [
      'filter-search',
      'filter-order',
      'filter-date',
      'filter-product',
      'filter-client',
      'filter-telephone',
      'filter-adress',
      'filter-observation',
      'filter-status',
      'filter-payment',
    ];

    filterIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const eventName = el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
      el.addEventListener(eventName, (e) => {
        const key = id.replace('filter-', '');
        this.filters[key] = e.target.value;
        this.filterAndRenderTable();
      });
    });

    const clearBtn = document.getElementById('btn-clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.resetFilters();
        this.filterAndRenderTable();
      });
    }
  }

  resetFilters() {
    this.filters = {
      search: '',
      order: '',
      date: '',
      product: '',
      client: '',
      telephone: '',
      adress: '',
      observation: '',
      status: '',
      payment: '',
    };

    const map = {
      search: 'filter-search',
      order: 'filter-order',
      date: 'filter-date',
      product: 'filter-product',
      client: 'filter-client',
      telephone: 'filter-telephone',
      adress: 'filter-adress',
      observation: 'filter-observation',
      status: 'filter-status',
      payment: 'filter-payment',
    };

    Object.values(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  async loadInitialData() {
    try {
      // Busca dados auxiliares para popular dropdowns
      const [statusS, statusP, tiposP] = await Promise.all([
        api.get('/api/status-servico').catch(() => []),
        api.get('/api/status-pagamento').catch(() => []),
        api.get('/api/tipos-produto').catch(() => [])
      ]);

      this.statusServicoList = statusS;
      this.statusPagamentoList = statusP;
      this.tiposProdutoList = tiposP;

      const selectStatus = document.getElementById('filter-status');
      if (selectStatus) {
        selectStatus.innerHTML = '<option value="">Todos os Status</option>' + buildOptions(this.statusServicoList, '');
      }

      const selectPayment = document.getElementById('filter-payment');
      if (selectPayment) {
        selectPayment.innerHTML = '<option value="">Todos os Pagamentos</option>' + buildOptions(this.statusPagamentoList, '');
      }

      const selectProduct = document.getElementById('filter-product');
      if (selectProduct) {
        selectProduct.innerHTML = '<option value="">Todos os Produtos</option>' + buildOptions(this.tiposProdutoList, '');
      }

      enhanceSelects(this.container);
      await this.fetchServices();
    } catch (e) {
      console.error(e);
      showToast(e.message || 'Erro ao carregar dados complementares.', 'error');
    }
  }

  async fetchServices() {
    const tbody = document.getElementById('services-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; color: var(--text-muted); padding: 40px;">
          <span class="loader-spinner" style="width: 24px; height: 24px; display: inline-block;"></span> Carregando serviços...
        </td>
      </tr>
    `;

    try {
      if (this.currentTab === 'geral') {
        this.services = await api.get('/api/servicos');
      } else {
        this.services = await api.get('/api/servicos/almoxarifado');
      }
      
      this.filterAndRenderTable();
    } catch (e) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; color: var(--error); padding: 40px;">
            ${e.message || 'Falha ao listar serviços.'}
          </td>
        </tr>
      `;
    }
  }

  filterAndRenderTable() {
    const headers = document.getElementById('table-headers');
    const tbody = document.getElementById('services-tbody');
    if (!headers || !tbody) return;

    // Filtra dados localmente
    const filtered = this.services.filter(s => {
      const search = this.filters.search.toLowerCase();
      const matchSearch = !search || [
        s.cod_servico,
        s.order_of_service,
        s.client,
        s.nome_cliente,
        s.telephone,
        s.telefone_cliente,
        s.product,
        s.nome_produto,
        s.adress,
        s.endereco_cliente,
        s.observation,
        s.observacao,
      ].some((value) => String(value || '').toLowerCase().includes(search));

      const matchOrder = !this.filters.order || String(s.order_of_service || s.cod_servico || '').includes(this.filters.order);
      const matchDate = !this.filters.date || String(s.created_at || s.createdAt || '').startsWith(this.filters.date);
      const matchProduct = !this.filters.product || String(s.product || s.nome_produto || '') === this.filters.product;
      const matchClient = !this.filters.client || String(s.client || s.nome_cliente || '').toLowerCase().includes(this.filters.client.toLowerCase());
      const matchTelephone = !this.filters.telephone || String(s.telephone || s.telefone_cliente || '').toLowerCase().includes(this.filters.telephone.toLowerCase());
      const matchAdress = !this.filters.adress || String(s.adress || s.endereco_cliente || '').toLowerCase().includes(this.filters.adress.toLowerCase());
      const matchObservation = !this.filters.observation || String(s.observation || s.observacao || '').toLowerCase().includes(this.filters.observation.toLowerCase());
      const matchStatus = !this.filters.status || String(s.status || s.status_servico || '') === this.filters.status;
      const matchPayment = !this.filters.payment || String(s.payment_status || s.status_pagamento || '') === this.filters.payment;

      return [
        matchSearch,
        matchOrder,
        matchDate,
        matchProduct,
        matchClient,
        matchTelephone,
        matchAdress,
        matchObservation,
        matchStatus,
        matchPayment,
      ].every(Boolean);
    });

    if (this.currentTab === 'geral') {
      headers.innerHTML = `
        <th>OS</th>
        <th>Data</th>
        <th>Cliente</th>
        <th>Telefone</th>
        <th>Produto</th>
        <th>Endereço</th>
        <th>Observação</th>
        <th>Status</th>
        <th>Pagamento</th>
        <th>Almoxarifado</th>
        <th style="text-align: right;">Ações</th>
      `;

      if (filtered.length === 0) {
        tbody.innerHTML = renderTableEmptyRow({ columns: 11, message: 'Nenhum serviço encontrado.' });
        return;
      }

      tbody.innerHTML = filtered.map(s => {
        const currentStatus = s.status || s.status_servico || '';
        const currentPayment = s.payment_status || s.status_pagamento || '';
        const orderCode = s.order_of_service || s.cod_servico || '-';
        const createdAt = s.created_at || s.createdAt || '-';
        const observation = String(s.observation || s.observacao || '-');

        return `
          <tr>
            <td>
              <a href="#/ordem-servico?cod=${encodeURIComponent(orderCode)}" style="color: var(--primary); font-weight: 700; text-decoration: none;">
                ${escapeHtml(String(orderCode))}
              </a>
            </td>
            <td>${formatDate(createdAt)}</td>
            <td><strong>${escapeHtml(s.client || s.nome_cliente || '-')}</strong></td>
            <td>${escapeHtml(s.telephone || s.telefone_cliente || '-')}</td>
            <td>${escapeHtml(s.product || s.nome_produto || '-')}</td>
            <td>${escapeHtml(s.adress || s.endereco_cliente || '-')}</td>
            <td title="${escapeHtml(observation)}">${escapeHtml(observation.slice(0, 42))}</td>
            <td>
              ${renderInlineSelect(buildOptions(this.statusServicoList, currentStatus), {
                className: 'select-inline-status',
                dataAttrs: `data-id="${s.id}" data-type="1"`,
                style: 'width: 120px;',
              })}
            </td>
            <td>
              ${renderInlineSelect(buildOptions(this.statusPagamentoList, currentPayment), {
                className: 'select-inline-payment',
                dataAttrs: `data-id="${s.id}" data-type="1"`,
                style: 'width: 120px;',
              })}
            </td>
            <td>
              ${renderWarehouseBadgeButton(s, 1)}
            </td>
            ${renderActionCell(`
              <button class="btn btn-secondary btn-sm edit-client-btn" data-id="${s.id}" title="Editar Dados do Cliente">
                <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-service-btn" data-id="${s.id}" data-cod="${s.cod_servico}" data-type="1" title="Excluir Serviço">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
              </button>
            `)}
          </tr>
        `;
      }).join('');
    } else {
      headers.innerHTML = `
        <th>OS</th>
        <th>Data</th>
        <th>Cliente</th>
        <th>Telefone</th>
        <th>Produto</th>
        <th>Endereço</th>
        <th>Observação</th>
        <th>Status Almoxarifado</th>
        <th style="text-align: right;">Ações</th>
      `;

      if (filtered.length === 0) {
        tbody.innerHTML = renderTableEmptyRow({ columns: 8, message: 'Nenhum item pendente no almoxarifado.' });
        return;
      }

      tbody.innerHTML = filtered.map(s => {
        const orderCode = s.order_of_service || s.cod_servico || '-';
        const observation = String(s.observation || s.observacao || '-');
        return `
          <tr>
            <td><strong style="color: var(--primary);">${escapeHtml(String(orderCode))}</strong></td>
            <td>${formatDate(s.created_at || s.createdAt)}</td>
            <td>${escapeHtml(s.client || s.nome_cliente || '-')}</td>
            <td>${escapeHtml(s.telephone || s.telefone_cliente || '-')}</td>
            <td>${escapeHtml(s.product || s.nome_produto || '-')}</td>
            <td>${escapeHtml(s.adress || s.endereco_cliente || '-')}</td>
            <td title="${escapeHtml(observation)}">${escapeHtml(observation.slice(0, 42))}</td>
            <td>
              ${renderWarehouseBadgeButton(s, 2)}
            </td>
            ${renderActionCell(`
              <button class="btn btn-danger btn-sm delete-service-btn" data-id="${s.id}" data-cod="${s.cod_servico}" data-type="2">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Excluir
              </button>
            `)}
          </tr>
        `;
      }).join('');
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.registerTableEvents();
  }

  registerTableEvents() {
    // 1. Mudança de Status do Serviço
    document.querySelectorAll('.select-inline-status').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const typeTable = parseInt(e.target.getAttribute('data-type'));
        const status = e.target.value;
        try {
          await api.put(`/api/servicos/status/${id}/${status}`, { typeTable });
          showToast('Status do serviço atualizado.', 'success');
          await this.fetchServices();
        } catch (err) {
          showToast(err.message || 'Erro ao atualizar status do serviço.', 'error');
        }
      });
    });

    // 2. Mudança de Status do Pagamento
    document.querySelectorAll('.select-inline-payment').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const typeTable = parseInt(e.target.getAttribute('data-type'));
        const status = e.target.value;
        try {
          await api.put(`/api/servicos/status/pagamento/${id}/${status}`, { typeTable });
          showToast('Status do pagamento atualizado.', 'success');
          await this.fetchServices();
        } catch (err) {
          showToast(err.message || 'Erro ao atualizar status do pagamento.', 'error');
        }
      });
    });

    // 3. Toggle de Almoxarifado
    document.querySelectorAll('.toggle-warehouse-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.currentTarget;
        const id = button.getAttribute('data-id');
        const typeTable = parseInt(button.getAttribute('data-type'));
        const currentVal = button.getAttribute('data-value') === 'true';
        const newVal = !currentVal;

        try {
          await api.put(`/api/servicos/almoxarifado/${id}/${newVal}`, { typeTable });
          showToast(`Almoxarifado atualizado para: ${newVal ? 'Entregue' : 'Pendente'}.`, 'success');
          await this.fetchServices();
        } catch (err) {
          showToast(err.message || 'Erro ao atualizar status do almoxarifado.', 'error');
        }
      });
    });

    // 4. Edição de dados de cliente
    document.querySelectorAll('.edit-client-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const service = this.services.find(s => String(s.id) === id);
        if (service) this.handleEditClient(service);
      });
    });

    // 5. Exclusão de serviço
      document.querySelectorAll('.delete-service-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const cod = e.currentTarget.getAttribute('data-cod');
          const typeTable = parseInt(e.currentTarget.getAttribute('data-type'));

          const approved = await confirmDialog({
            title: 'Excluir serviço',
            text: `Deseja realmente remover o serviço ${cod}?`,
            confirmButtonText: 'Excluir',
            icon: 'warning',
          });

          if (approved) {
          try {
            await api.delete(`/api/servicos/${id}/${cod}/${typeTable}`);
            showToast('Serviço removido com sucesso.', 'success');
            await this.fetchServices();
          } catch (err) {
            showToast(err.message || 'Erro ao remover serviço.', 'error');
          }
        }
      });
    });
  }

  handleNewService() {
    const statusOptions = this.statusServicoList.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');
    const productOptions = this.tiposProdutoList.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`).join('');

    const bodyHtml = `
      <form id="new-service-form">
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Cliente *',
            controlHtml: '<input type="text" id="service-client" class="form-control" required placeholder="Nome do cliente">',
          })}
          ${renderFormGroup({
            label: 'Telefone *',
            controlHtml: '<input type="text" id="service-telephone" class="form-control" required placeholder="(99) 99999-9999">',
          })}
        `)}
        ${renderFormGroup({
          label: 'Produto / Equipamento *',
          controlHtml: `
            <select id="service-product" class="form-control" required>
              <option value="">Selecione o Produto</option>
              ${productOptions}
            </select>
          `,
        })}
        ${renderFormGroup({
          label: 'Endereço',
          controlHtml: '<input type="text" id="service-adress" class="form-control" placeholder="Rua, número, bairro, cidade">',
        })}
        ${renderFormGroup({
          label: 'Observações',
          controlHtml: '<textarea id="service-observation" class="form-control" rows="3" placeholder="Detalhes adicionais do serviço"></textarea>',
        })}
        ${renderFormGroup({
          label: 'Status Inicial *',
          controlHtml: `
            <select id="service-status" class="form-control" required>
              ${statusOptions}
            </select>
          `,
        })}
      </form>
    `;

    createAsyncFormModal({
      title: 'Cadastrar Novo Serviço',
      bodyHtml,
      confirmText: 'Salvar Serviço',
      onSubmit: async () => {
        const client = document.getElementById('service-client').value.trim();
        const telephone = document.getElementById('service-telephone').value.trim();
        const product = document.getElementById('service-product').value;
        const adress = document.getElementById('service-adress').value.trim();
        const observation = document.getElementById('service-observation').value.trim();
        const status = document.getElementById('service-status').value;

        if (!client || !telephone || !product || !status) {
          throw new Error('Todos os campos marcados com * são obrigatórios.');
        }

        await api.post('/api/servicos', { client, telephone, product, adress, observation, status });
        await this.fetchServices();
      },
      successMessage: 'Serviço cadastrado com sucesso!',
    });
  }

  handleEditClient(service) {
    const bodyHtml = `
      <form id="edit-client-form">
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Cliente *',
            controlHtml: `<input type="text" id="edit-client-name" class="form-control" required value="${escapeHtml(service.client || service.nome_cliente || '')}">`,
          })}
          ${renderFormGroup({
            label: 'Telefone *',
            controlHtml: `<input type="text" id="edit-client-phone" class="form-control" required value="${escapeHtml(service.telephone || service.telefone_cliente || '')}">`,
          })}
        `)}
        ${renderFormGroup({
          label: 'Produto / Equipamento *',
          controlHtml: `<input type="text" id="edit-client-product" class="form-control" required value="${escapeHtml(service.product || service.nome_produto || '')}">`,
        })}
        ${renderFormGroup({
          label: 'Endereço',
          controlHtml: `<input type="text" id="edit-client-adress" class="form-control" value="${escapeHtml(service.adress || service.endereco_cliente || '')}">`,
        })}
        ${renderFormGroup({
          label: 'Observações',
          controlHtml: `<textarea id="edit-client-obs" class="form-control" rows="3">${escapeHtml(service.observation || service.observacao || '')}</textarea>`,
        })}
      </form>
    `;

    createAsyncFormModal({
      title: `Editar Info do Serviço - ${service.cod_servico}`,
      bodyHtml,
      confirmText: 'Salvar Alterações',
      onSubmit: async () => {
        const client = document.getElementById('edit-client-name').value.trim();
        const telephone = document.getElementById('edit-client-phone').value.trim();
        const product = document.getElementById('edit-client-product').value.trim();
        const adress = document.getElementById('edit-client-adress').value.trim();
        const observation = document.getElementById('edit-client-obs').value.trim();

        if (!client || !telephone || !product) {
          throw new Error('Cliente, Telefone e Produto são obrigatórios.');
        }

        await api.put(`/api/servicos/info/cliente/${service.id}`, {
          client,
          telephone,
          product,
          adress,
          observation
        });
        await this.fetchServices();
      },
      successMessage: 'Informações do cliente atualizadas.',
    });
  }

  destroy() {}
}
