import dotenv from 'dotenv';
import { server } from './app.js';
import './socket.js';
import StuckServicesJob from '../modules/operational/jobs/stuck-services.job.js';
import { env } from './config/env.js';
import DatabaseBootstrap from './database/bootstrap.js';

dotenv.config();

async function startServer() {
  await DatabaseBootstrap.init();

  server.listen(env.port, () => {
    console.log(`Servidor HTTP em: http://localhost:${env.port}`);
    StuckServicesJob.init();
  });
}

startServer().catch((error) => {
  console.error('[startup] Falha ao inicializar a aplicação', error);
  process.exit(1);
});
