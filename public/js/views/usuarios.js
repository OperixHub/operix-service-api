/* ==========================================================================
   Operix Hub - Usuários
   ========================================================================== */

import api from '../api.js';
import { confirmDialog, showToast, createModal, createAsyncFormModal } from '../helpers.js';
import { getInitials, renderPageHeader, renderTableEmptyRow, renderTablePanel, renderFormGroup, renderFormRow } from '../ui.js';

export default class UsuariosView {
  constructor(container) {
    this.container = container;
    this.users = [];
  }

  async render() {
    const isCurrentUserAdmin = api.getAccess()?.is_admin || api.getUser()?.admin;

    this.container.innerHTML = `
      ${renderPageHeader({
        title: 'Usuários & Controle de Acesso',
        description: 'Controle quem pode acessar o sistema e quais permissões de leitura ou gravação cada membro possui.',
        actions: isCurrentUserAdmin ? `
          <button class="btn btn-primary" id="btn-new-user">
            <i data-lucide="user-plus"></i> Novo Usuário
          </button>
        ` : '',
      })}

      ${renderTablePanel({
        tableId: 'users',
        loadingColumns: isCurrentUserAdmin ? 7 : 6,
        loadingMessage: 'Carregando usuários...',
        headersHtml: `
          <tr>
            <th>Nome</th>
            <th>Usuário</th>
            <th>Email</th>
            <th>Cargo / Função</th>
            <th>Administrador</th>
            <th>Status</th>
            ${isCurrentUserAdmin ? '<th style="text-align: right;">Ações</th>' : ''}
          </tr>
        `,
      })}
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    if (isCurrentUserAdmin) {
      document.getElementById('btn-new-user').addEventListener('click', () => this.handleNewUser());
    }

    await this.fetchUsers();
  }

  async fetchUsers() {
    try {
      this.users = await api.get('/api/usuarios');
      this.renderTable();
    } catch (e) {
      document.getElementById('users-tbody').innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--error); padding: 20px;">
            ${e.message || 'Erro ao carregar usuários.'}
          </td>
        </tr>
      `;
    }
  }

  renderTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    const isCurrentUserAdmin = api.getAccess()?.is_admin || api.getUser()?.admin;

    if (this.users.length === 0) {
      tbody.innerHTML = renderTableEmptyRow({
        columns: isCurrentUserAdmin ? 7 : 6,
        message: 'Nenhum usuário cadastrado na organização.',
      });
      return;
    }

    tbody.innerHTML = this.users.map(u => {
      const initials = getInitials(u.name);
      const adminBadge = u.admin ? '<span class="badge badge-primary">Sim</span>' : '<span class="badge badge-muted">Não</span>';
      const activeBadge = u.active ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-danger">Inativo</span>';

      let actionsHtml = '';
      if (isCurrentUserAdmin) {
        actionsHtml = `
          <td style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm toggle-access-btn" data-id="${u.id}" title="Alterar Cargo/Acesso">
              <i data-lucide="sliders" style="width: 14px; height: 14px;"></i> Cargo
            </button>
            <button class="btn btn-secondary btn-sm edit-perms-btn" data-id="${u.id}" title="Permissões Granulares">
              <i data-lucide="key" style="width: 14px; height: 14px;"></i> Permissões
            </button>
            <button class="btn btn-danger btn-sm delete-user-btn" data-id="${u.id}" data-name="${u.name}" title="Remover Usuário">
              <i data-lucide="user-x" style="width: 14px; height: 14px;"></i>
            </button>
          </td>
        `;
      }

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; background-color: var(--border-focus);">${initials}</div>
              <strong>${u.name}</strong>
            </div>
          </td>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.role_title || 'Membro'}</td>
          <td>${adminBadge}</td>
          <td>${activeBadge}</td>
          ${actionsHtml}
        </tr>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    if (isCurrentUserAdmin) {
      this.registerEvents();
    }
  }

  registerEvents() {
    // 1. Alterar Cargo / Acesso
    document.querySelectorAll('.toggle-access-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const user = this.users.find(u => String(u.id) === id);
        if (user) this.handleToggleAccess(user);
      });
    });

    // 2. Customizar Permissões overrides
    document.querySelectorAll('.edit-perms-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const user = this.users.find(u => String(u.id) === id);
        if (user) this.handleEditPermissions(user);
      });
    });

    // 3. Remover Usuário
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');

        const approved = await confirmDialog({
          title: 'Remover usuário',
          text: `Deseja realmente remover o usuário "${name}" do sistema?`,
          confirmButtonText: 'Remover',
          icon: 'warning',
        });

        if (approved) {
          try {
            await api.delete(`/api/usuarios/${id}`);
            showToast('Usuário removido com sucesso.', 'success');
            await this.fetchUsers();
          } catch (err) {
            showToast(err.message || 'Erro ao remover usuário.', 'error');
          }
        }
      });
    });
  }

  handleNewUser() {
    const bodyHtml = `
      <form id="new-user-form">
        ${renderFormGroup({
          label: 'Nome Completo *',
          controlHtml: '<input type="text" id="user-name" class="form-control" required placeholder="ex: João Silva">',
        })}
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Nome de Usuário (Login) *',
            controlHtml: '<input type="text" id="user-username" class="form-control" required placeholder="ex: joao.silva">',
          })}
          ${renderFormGroup({
            label: 'Email *',
            controlHtml: '<input type="email" id="user-email" class="form-control" required placeholder="ex: joao@operix.com">',
          })}
        `)}
        ${renderFormRow(`
          ${renderFormGroup({
            label: 'Senha Provisória * (Mínimo 8 caracteres)',
            controlHtml: '<input type="password" id="user-password" class="form-control" required placeholder="Digite uma senha forte">',
          })}
          ${renderFormGroup({
            label: 'Cargo / Título da Função',
            controlHtml: '<input type="text" id="user-role-title" class="form-control" placeholder="ex: Técnico de Campo">',
          })}
        `)}
        <div class="form-group">
          <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 8px;">
            <input type="checkbox" id="user-admin">
            <span>Definir como Administrador da Organização</span>
          </label>
        </div>
        ${renderFormGroup({
          label: 'Módulos Permitidos Iniciais',
          controlHtml: `
            <select id="user-modules" class="form-control" multiple placeholder="Selecione os módulos">
              <option value="operational" selected>Operacional (Serviços)</option>
              <option value="inventory" selected>Inventário (Estoque)</option>
            </select>
          `,
          hint: 'Use Ctrl/Cmd para selecionar mais de um módulo.',
        })}
      </form>
    `;

    createAsyncFormModal({
      title: 'Cadastrar Novo Usuário',
      bodyHtml,
      confirmText: 'Criar Usuário',
      onSubmit: async () => {
        const name = document.getElementById('user-name').value.trim();
        const username = document.getElementById('user-username').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;
        const role_title = document.getElementById('user-role-title').value.trim() || null;
        const admin = document.getElementById('user-admin').checked;
        
        const moduleSelect = document.getElementById('user-modules');
        const modules = Array.from(moduleSelect?.selectedOptions || []).map((el) => el.value);

        if (!name || !username || !email || !password || password.length < 8) {
          throw new Error('Preencha todos os campos obrigatórios (*) corretamente.');
        }

        await api.post('/api/usuarios', {
          name,
          username,
          email,
          password,
          role_title,
          admin,
          modules
        });
        await this.fetchUsers();
      },
      successMessage: 'Usuário cadastrado com sucesso!',
    });
  }

  handleToggleAccess(user) {
    const bodyHtml = `
      <form id="edit-access-form">
        ${renderFormGroup({
          label: 'Cargo / Título da Função',
          controlHtml: `<input type="text" id="edit-user-role-title" class="form-control" value="${user.role_title || ''}" placeholder="ex: Técnico N1">`,
        })}
        <div class="form-group">
          <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="edit-user-admin" ${user.admin ? 'checked' : ''}>
            <span>Permissões Administrativas (Acesso Total)</span>
          </label>
        </div>
        <div class="form-group">
          <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="edit-user-active" ${user.active ? 'checked' : ''}>
            <span>Conta de Usuário Ativa</span>
          </label>
        </div>
      </form>
    `;

    createAsyncFormModal({
      title: `Configurar Acesso - ${user.name}`,
      bodyHtml,
      confirmText: 'Salvar Configurações',
      onSubmit: async () => {
        const role_title = document.getElementById('edit-user-role-title').value.trim() || null;
        const admin = document.getElementById('edit-user-admin').checked;
        const active = document.getElementById('edit-user-active').checked;

        await api.patch(`/api/usuarios/${user.id}/acesso`, {
          role_title,
          admin,
          active
        });
        await this.fetchUsers();
      },
      successMessage: 'Nível de acesso do usuário atualizado.',
    });
  }

  async handleEditPermissions(user) {
    // 1. Abre modal com loader temporário
    const placeholderModal = createModal({
      title: `Carregando Permissões - ${user.name}`,
      bodyHtml: `
        <div style="text-align: center; padding: 20px;">
          <span class="loader-spinner" style="width: 24px; height: 24px; display: inline-block;"></span>
          <p style="margin-top: 10px; color: var(--text-secondary);">Carregando catálogo e regras...</p>
        </div>
      `,
      confirmText: 'Aguarde',
      onConfirm: () => Promise.resolve()
    });

    try {
      // 2. Busca catálogo de permissões e overrides do usuário em paralelo
      const [catalogo, overrides] = await Promise.all([
        api.get('/api/permissoes/catalogo'),
        api.get(`/api/permissoes/usuarios/${user.id}`)
      ]);

      // Fecha o placeholder
      placeholderModal.remove();

      // Mapeia overrides existentes
      const allowed = new Set(overrides.allowed_overrides || []);
      const denied = new Set(overrides.denied_overrides || []);

      // Constrói HTML do grid por módulos
      let catalogHtml = '<div style="max-height: 400px; overflow-y: auto; padding-right: 8px;">';

      for (const [moduleKey, moduleInfo] of Object.entries(catalogo)) {
        catalogHtml += `
          <div style="margin-bottom: 20px;">
            <h4 style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 0.8rem; color: var(--primary); letter-spacing: 0.05em;">
              ${moduleInfo.label}
            </h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
        `;

        for (const item of (moduleInfo.items || [])) {
          const isAllowed = allowed.has(item.key);
          const isDenied = denied.has(item.key);

          catalogHtml += `
            <div style="display: flex; align-items: center; justify-content: space-between; background-color: var(--bg-primary); border: 1px solid var(--border-color); padding: 10px 14px; border-radius: var(--border-radius);">
              <div style="display: flex; flex-direction: column; max-width: 70%;">
                <span style="font-size: 0.85rem; font-weight: 600;">${item.name}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${item.description}</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <label style="display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--text-secondary); cursor: pointer;">
                  <input type="radio" name="perm-${item.key}" value="allow" ${isAllowed ? 'checked' : ''}>
                  <span>Permitir</span>
                </label>
                <label style="display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--text-secondary); cursor: pointer;">
                  <input type="radio" name="perm-${item.key}" value="deny" ${isDenied ? 'checked' : ''}>
                  <span>Negar</span>
                </label>
                <label style="display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--text-secondary); cursor: pointer;">
                  <input type="radio" name="perm-${item.key}" value="default" ${(!isAllowed && !isDenied) ? 'checked' : ''}>
                  <span>Padrão</span>
                </label>
              </div>
            </div>
          `;
        }

        catalogHtml += '</div></div>';
      }
      catalogHtml += '</div>';

      // 3. Mostra modal final com os controles de permissões
      createModal({
        title: `Permissões Customizadas - ${user.name}`,
        bodyHtml: catalogHtml,
        confirmText: 'Salvar Permissões',
        onConfirm: async () => {
          const newAllowed = [];
          const newDenied = [];

          // Varre todas as chaves mapeadas no catálogo para extrair o valor dos rádios
          for (const moduleInfo of Object.values(catalogo)) {
            for (const item of (moduleInfo.items || [])) {
              const radioEl = document.querySelector(`input[name="perm-${item.key}"]:checked`);
              if (radioEl) {
                if (radioEl.value === 'allow') newAllowed.push(item.key);
                else if (radioEl.value === 'deny') newDenied.push(item.key);
              }
            }
          }

          // Grava no backend
          await api.put(`/api/permissoes/usuarios/${user.id}`, {
            allowed_overrides: newAllowed,
            denied_overrides: newDenied
          });

          showToast('Sobrescritas de permissões atualizadas!', 'success');
          await this.fetchUsers();
        }
      });

    } catch (err) {
      placeholderModal.remove();
      showToast(err.message || 'Erro ao carregar permissões.', 'error');
    }
  }

  destroy() {}
}
