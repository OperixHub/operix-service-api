/* ==========================================================================
   Operix Hub - Helpers & Utilities
   ========================================================================== */

import { escapeHtml } from './ui.js';

/**
 * Exibe uma notificação do tipo Toast no canto inferior direito.
 * @param {string} message 
 * @param {'success' | 'warning' | 'error' | 'primary'} type 
 * @param {number} duration 
 */
export function showToast(message, type = 'primary', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'error') icon = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${escapeHtml(message)}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);
  
  // Inicializa o ícone do Lucide inserido dinamicamente
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Remove toast ao clicar no fechar
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  // Auto-remove após a duração especificada
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Exibe um alerta amigável usando SweetAlert2 quando disponível.
 * Fallback: `window.alert`.
 */
export async function showDialog({
  title = 'Aviso',
  text = '',
  icon = 'info',
  confirmButtonText = 'OK',
}) {
  if (window.Swal?.fire) {
    await window.Swal.fire({
      title,
      text,
      icon,
      confirmButtonText,
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      confirmButtonColor: 'var(--primary)',
      customClass: {
        popup: 'operix-swal-popup',
        title: 'operix-swal-title',
        htmlContainer: 'operix-swal-text',
      },
    });
    return;
  }

  window.alert(text ? `${title}\n\n${text}` : title);
}

/**
 * Abre uma confirmação amigável e retorna `true` se o usuário confirmou.
 */
export async function confirmDialog({
  title = 'Confirmar ação',
  text = '',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  icon = 'warning',
}) {
  if (window.Swal?.fire) {
    const result = await window.Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      confirmButtonColor: 'var(--error)',
      cancelButtonColor: 'var(--bg-tertiary)',
      customClass: {
        popup: 'operix-swal-popup',
        title: 'operix-swal-title',
        htmlContainer: 'operix-swal-text',
      },
    });
    return result.isConfirmed;
  }

  return window.confirm(text ? `${title}\n\n${text}` : title);
}

/**
 * Formata valores numéricos em Moeda Brasileira (R$).
 * @param {number|string} value 
 * @returns {string}
 */
export function formatCurrency(value) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue);
}

/**
 * Formata datas no padrão brasileiro DD/MM/AAAA.
 * @param {string} dateStr 
 * @param {boolean} showTime 
 * @returns {string}
 */
export function formatDate(dateStr, showTime = true) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  if (showTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('pt-BR', options).format(date);
}

/**
 * Cria ou injeta um modal genérico na página.
 * @param {object} config 
 * @param {string} config.title
 * @param {string} config.bodyHtml
 * @param {string} [config.confirmText]
 * @param {string} [config.cancelText]
 * @param {function} [config.onConfirm]
 * @param {function} [config.onCancel]
 */
export function createModal({ title, bodyHtml, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel }) {
  // Remove qualquer modal existente
  const existingOverlay = document.querySelector('.modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">${escapeHtml(title)}</h3>
        <button class="modal-close" id="modal-btn-close-x"><i data-lucide="x"></i></button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-btn-cancel">${cancelText}</button>
        <button class="btn btn-primary" id="modal-btn-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
  enhanceSelects(overlay);

  // Ativa animação
  setTimeout(() => overlay.classList.add('active'), 10);

  const closeModal = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 250);
  };

  // Event Listeners
  overlay.querySelector('#modal-btn-close-x').addEventListener('click', () => {
    if (onCancel) onCancel();
    closeModal();
  });

  overlay.querySelector('#modal-btn-cancel').addEventListener('click', () => {
    if (onCancel) onCancel();
    closeModal();
  });

  overlay.querySelector('#modal-btn-confirm').addEventListener('click', async () => {
    const confirmBtn = overlay.querySelector('#modal-btn-confirm');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="loader-spinner" style="width: 14px; height: 14px; border-width: 2px;"></span>';
    
    try {
      if (onConfirm) {
        await onConfirm(overlay);
      }
      closeModal();
    } catch (err) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = confirmText;
      showToast(err.message || 'Erro ao processar ação.', 'error');
    }
  });

  return overlay;
}

/**
 * Abre um modal de formulário com submissão assíncrona padronizada.
 * @param {object} config
 * @param {string} config.title
 * @param {string} config.bodyHtml
 * @param {string} [config.confirmText]
 * @param {string} [config.cancelText]
 * @param {string} [config.successMessage]
 * @param {function} config.onSubmit
 * @param {function} [config.onSuccess]
 * @param {function} [config.onError]
 */
export function createAsyncFormModal({
  title,
  bodyHtml,
  confirmText = 'Salvar',
  cancelText = 'Cancelar',
  successMessage = '',
  onSubmit,
  onSuccess,
  onError,
}) {
  return createModal({
    title,
    bodyHtml,
    confirmText,
    cancelText,
    onConfirm: async (overlay) => {
      try {
        const result = await onSubmit(overlay);
        if (successMessage) {
          showToast(successMessage, 'success');
        }
        if (onSuccess) {
          await onSuccess(result, overlay);
        }
      } catch (error) {
        if (onError) {
          await onError(error, overlay);
        }
        throw error;
      }
    },
  });
}

/**
 * Inicializa componentes de seleção mais amigáveis com Tom Select.
 * Não mexe em selects explícitos de tabela (marcados com data-no-enhance).
 */
export function enhanceSelects(root = document) {
  if (!window.TomSelect) return;

  const selectElements = root.querySelectorAll(
    'select.form-control:not([data-no-enhance="true"]):not(.ts-hidden-accessible)',
  );

  selectElements.forEach((select) => {
    if (select.tomselect) return;

    // Mantém o comportamento mais leve em selects simples e habilita multiselect com remoção.
    // Tom Select trabalha sobre o <select> original, então a API continua igual.
    // @ts-ignore
    new window.TomSelect(select, {
      plugins: select.multiple ? ['remove_button'] : [],
      create: false,
      persist: false,
      maxItems: select.multiple ? null : 1,
      allowEmptyOption: true,
      placeholder: select.getAttribute('placeholder') || undefined,
      render: {
        no_results: () => '<div class="no-results">Nenhuma opção encontrada</div>',
      },
    });
  });
}

/**
 * Retorna a badge HTML de acordo com o status do Serviço.
 * @param {string} status 
 * @returns {string}
 */
export function getStatusBadgeHtml(status) {
  const normalized = (status || '').toLowerCase();
  
  if (['concluído', 'concluido', 'concluding', 'finished', 'finalizado'].includes(normalized)) {
    return `<span class="badge badge-success">${status}</span>`;
  }
  if (['pendente', 'pending', 'aguardando', 'aberto', 'novo'].includes(normalized)) {
    return `<span class="badge badge-warning">${status}</span>`;
  }
  if (['cancelado', 'canceled', 'blocked', 'bloqueado'].includes(normalized)) {
    return `<span class="badge badge-danger">${status}</span>`;
  }
  return `<span class="badge badge-primary">${status}</span>`;
}

/**
 * Retorna a badge HTML de acordo com o status de Pagamento.
 * @param {string} status 
 * @returns {string}
 */
export function getPaymentBadgeHtml(status) {
  const normalized = (status || '').toLowerCase();
  if (['pago', 'paid', 'concluido', 'concluído', 'sucesso'].includes(normalized)) {
    return `<span class="badge badge-success">${status}</span>`;
  }
  if (['pendente', 'pending', 'aguardando', 'não pago', 'aberto'].includes(normalized)) {
    return `<span class="badge badge-warning">${status}</span>`;
  }
  if (['reembolsado', 'estornado', 'cancelado'].includes(normalized)) {
    return `<span class="badge badge-danger">${status}</span>`;
  }
  return `<span class="badge badge-primary">${status}</span>`;
}
