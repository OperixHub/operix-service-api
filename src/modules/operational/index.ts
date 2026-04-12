// API pública do módulo operational
// APENAS estes exports podem ser importados por outros módulos

export { ServicesQueryService } from './services/services.service.js';

// Re-export do router para uso no core/router.ts
export { default as operationalRouter } from './operational.routes.js';
