import { server } from './app.js';
import './socket.js';
import dotenv from 'dotenv';
import StuckServicesJob from '../modules/operational/jobs/stuck-services.job.js';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3333;

server.listen(PORT, () => {
  console.log(`Servidor Http em: http://localhost:${PORT}`);

  // Inicializa Tarefas Cronológicas em Background
  StuckServicesJob.init();
});
