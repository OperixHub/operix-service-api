/* ==========================================================================
   Operix Hub - UI Primitives
   ========================================================================== */

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getInitials(name) {
  if (!name) return 'OP';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'OP';
}

export function renderPageHeader({ title, description = '', actions = '' }) {
  return `
    <div class="page-header">
      <div class="page-header__content">
        <h2 class="page-title">${escapeHtml(title)}</h2>
        ${description ? `<p class="page-subtitle">${escapeHtml(description)}</p>` : ''}
      </div>
      ${actions ? `<div class="page-header__actions">${actions}</div>` : ''}
    </div>
  `;
}

export function renderSectionHeader({ title, description = '', actions = '' }) {
  return `
    <div class="section-header">
      <div>
        <h3 class="section-title">${escapeHtml(title)}</h3>
        ${description ? `<p class="section-subtitle">${escapeHtml(description)}</p>` : ''}
      </div>
      ${actions ? `<div class="section-actions">${actions}</div>` : ''}
    </div>
  `;
}

export function renderEmptyState({ icon = 'inbox', title, description, action = '' }) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">
        <i data-lucide="${icon}"></i>
      </div>
      <h4 class="empty-state__title">${escapeHtml(title)}</h4>
      ${description ? `<p class="empty-state__description">${escapeHtml(description)}</p>` : ''}
      ${action ? `<div class="empty-state__action">${action}</div>` : ''}
    </div>
  `;
}

export function renderLoadingRow({ columns = 1, message = 'Carregando...' } = {}) {
  return `
    <tr>
      <td colspan="${columns}" style="text-align: center; color: var(--text-muted); padding: 40px;">
        <span class="loader-spinner" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"></span>
        <span style="margin-left: 10px;">${escapeHtml(message)}</span>
      </td>
    </tr>
  `;
}

export function renderTableEmptyRow({ columns = 1, message = 'Nenhum registro encontrado.' } = {}) {
  return `
    <tr>
      <td colspan="${columns}" style="text-align: center; color: var(--text-muted); padding: 30px;">
        ${escapeHtml(message)}
      </td>
    </tr>
  `;
}

/**
 * Renderiza uma estrutura padrão de tabela dentro de um painel.
 * @param {object} config
 * @param {string} config.tableId
 * @param {string} config.headersHtml
 * @param {number} config.loadingColumns
 * @param {string} [config.loadingMessage]
 * @param {string} [config.footerHtml]
 */
export function renderTablePanel({
  tableId,
  headersHtml,
  loadingColumns,
  loadingMessage = 'Carregando...',
  footerHtml = '',
  wrapInPanel = true,
}) {
  const tableHtml = `
    <div class="table-responsive">
      <table class="data-table" id="${escapeHtml(tableId)}">
        <thead>
          ${headersHtml}
        </thead>
        <tbody id="${escapeHtml(`${tableId}-tbody`)}">
          ${renderLoadingRow({ columns: loadingColumns, message: loadingMessage })}
        </tbody>
      </table>
    </div>
    ${footerHtml}
  `;

  return wrapInPanel ? `<div class="panel">${tableHtml}</div>` : tableHtml;
}

export function renderFormGroup({ label, controlHtml, hint = '', inline = false }) {
  return `
    <div class="form-group${inline ? ' form-group-inline' : ''}">
      <label class="form-label">${escapeHtml(label)}</label>
      ${controlHtml}
      ${hint ? `<small class="form-hint">${escapeHtml(hint)}</small>` : ''}
    </div>
  `;
}

export function renderFormRow(contentHtml) {
  return `<div class="form-row">${contentHtml}</div>`;
}

export function renderActionCell(contentHtml, align = 'right') {
  const justifyContent = align === 'right' ? 'flex-end' : align;
  return `<td style="text-align: ${align}; display: flex; gap: 8px; justify-content: ${justifyContent};">${contentHtml}</td>`;
}

export function renderInlineSelect(optionsHtml, { className = '', dataAttrs = '', style = '' } = {}) {
  return `
    <select class="form-control ${className}" data-no-enhance="true" ${dataAttrs} style="padding: 4px 8px; font-size: 0.8rem; ${style}">
      ${optionsHtml}
    </select>
  `;
}
