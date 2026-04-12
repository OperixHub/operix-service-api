import dotenv from 'dotenv';
import express, { json, type Request, type Response } from 'express';
import { createServer, type Server as HttpServer } from 'http';
import router from './router.js';
import { Server, type Server as SocketServer } from 'socket.io';
import cors from 'cors';
import GlobalErrorHandler from './middlewares/global-error-handler.middleware.js';
import ResponseHandler from './utils/response-handler.js';
import LogMiddleware from './middlewares/log.middleware.js';

dotenv.config();

const app = express();
const server: HttpServer = createServer(app);
const io: SocketServer = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

(app as any).io = io;

app.use(json());
app.use(cors({
  origin: process.env.ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Authorization', 'Content-Type', 'Accept']
}));

app.use(LogMiddleware.handle);

app.use(router);

// 404 Handler - Para rotas não encontradas
app.use((_req: Request, res: Response) => {
  return ResponseHandler.error(res, 'Rota não encontrada', 404);
});

// Global Error Handler - Captura todas as exceções não tratadas
app.use(GlobalErrorHandler.handle);

export { server, io, app };
export default app;
