// API pública do módulo operational
// APENAS estes exports podem ser importados por outros módulos

export { ConsultaServicosService } from './servicos/servicos.service.js';

// Re-export do router para uso no core/router.ts
export { default as operationalRouter } from './operacional.routes.js';
