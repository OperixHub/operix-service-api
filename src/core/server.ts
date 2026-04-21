import dotenv from 'dotenv';
import { server } from './app.js';
import './socket.js';
import StuckServicesJob from '../modules/operational/jobs/stuck-services.job.js';
import { env } from './config/env.js';

dotenv.config();

server.listen(env.port, () => {
  console.log(`Servidor HTTP em: http://localhost:${env.port}`);
  StuckServicesJob.init();
});
