import dotenv from 'dotenv';
import express, { json, type Request, type Response, type NextFunction } from 'express';
import { createServer, type Server as HttpServer } from 'http';
import router from './router';
import { Server, type Server as SocketServer } from 'socket.io';
import cors from 'cors';

dotenv.config();

const app = express();
const server: HttpServer = createServer(app);
const io: SocketServer = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(json());
app.use(cors({
  origin: process.env.ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Authorization', 'Content-Type', 'Accept']
}));

app.use((_req: Request, res: Response, next: NextFunction) => {
  next();
});

app.use(router);


export { server, io, app };
export default app;
