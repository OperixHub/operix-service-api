import dotenv from 'dotenv';
import express, { json, type Request, type Response } from 'express';
import { createServer, type Server as HttpServer } from 'http';
import cors from 'cors';
import { Server, type Server as SocketServer } from 'socket.io';
import path from 'path';
import router from './router.js';
import TratadorErroGlobal from './middlewares/tratador-erro-global.middleware.js';
import RegistroMiddleware from './middlewares/registro.middleware.js';
import ManipuladorResposta from './utils/manipulador-resposta.js';
import SegurancaMiddleware from './middlewares/seguranca.middleware.js';
import { env } from './config/env.js';

dotenv.config();

const app = express();
const server: HttpServer = createServer(app);

const io: SocketServer = new Server(server, {
  cors: {
    origin: env.origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.disable('x-powered-by');
(app as any).io = io;

app.use(SegurancaMiddleware.handle);
app.use(json({ limit: '1mb' }));
app.use(cors({
  origin: env.origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Authorization', 'Content-Type', 'Accept'],
}));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(RegistroMiddleware.handle);
app.use(router);

// Roteamento fallback para SPA: para qualquer rota não mapeada na API, serve index.html
app.use((req: Request, res: Response, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/docs') || req.path.startsWith('/saude')) {
    ManipuladorResposta.erro(res, 'Rota não encontrada', 404);
  } else {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'), (err) => {
      if (err) {
        ManipuladorResposta.erro(res, 'Interface não inicializada', 404);
      }
    });
  }
});

app.use(TratadorErroGlobal.handle);

export { server, io, app };
export default app;
