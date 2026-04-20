import dotenv from 'dotenv';
import express, { json, type Request, type Response } from 'express';
import { createServer, type Server as HttpServer } from 'http';
import cors from 'cors';
import { Server, type Server as SocketServer } from 'socket.io';
import router from './router.js';
import GlobalErrorHandler from './middlewares/global-error-handler.middleware.js';
import LogMiddleware from './middlewares/log.middleware.js';
import ResponseHandler from './utils/response-handler.js';
import SecurityMiddleware from './middlewares/security.middleware.js';
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

app.use(SecurityMiddleware.handle);
app.use(json({ limit: '1mb' }));
app.use(cors({
  origin: env.origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Authorization', 'Content-Type', 'Accept'],
}));
app.use(LogMiddleware.handle);

app.use(router);

app.use((_req: Request, res: Response) => ResponseHandler.error(res, 'Rota nÃ£o encontrada', 404));
app.use(GlobalErrorHandler.handle);

export { server, io, app };
export default app;
