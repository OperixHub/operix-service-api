// API pÃºblica do mÃ³dulo operational
// APENAS estes exports podem ser importados por outros mÃ³dulos

export { ServicesQueryService } from './services/services.service.js';

// Re-export do router para uso no core/router.ts
export { default as operationalRouter } from './operational.routes.js';
