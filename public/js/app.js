/* ==========================================================================
   Operix Hub - Inicializador Principal SPA
   ========================================================================== */

import api from './api.js';
import router from './router.js';
import { showToast } from './helpers.js';

async function bootstrap() {
  try {
    // 1. Verifica se temos credenciais salvas
    if (api.isAuthenticated()) {
      try {
        // Valida a sessão contra o servidor e atualiza os papéis/permissões
        await api.hydrateSession();
      } catch (err) {
        console.warn('Erro ao validar sessão no startup:', err);
        
        // Se der erro de autenticação (ex: refresh expirado), desloga o usuário
        if (err.status === 401) {
          api.clearSession();
          showToast(err.message || 'Sessão expirada. Por favor, logue novamente.', 'warning');
        }
      }
    }

    // 2. Aciona o Roteamento Inicial baseado no hash atual
    await router.handleRouting();

  } catch (error) {
    console.error('Falha crítica na inicialização:', error);
    showToast('Falha na inicialização do sistema.', 'error');
  }
}

// Inicializa a aplicação quando o DOM estiver completamente pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
