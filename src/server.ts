import { server } from './app';
import './socket';
import dotenv from 'dotenv';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3333;

server.listen(PORT, () =>
  console.log(`Servidor Http em: http://localhost:${PORT}`)
);
