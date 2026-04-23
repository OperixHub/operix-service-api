import { io } from './app.js';
import MessagingService from './utils/messaging.service.js';
import AuthMiddleware from './middlewares/auth.middleware.js';

MessagingService.init(io);

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
  if (!token) {
    return next(new Error('Autenticação WebSockets Necessária'));
  }

  const cleanToken = typeof token === 'string' && token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  try {
    const user = await AuthMiddleware.verifyRawToken(cleanToken as string);
    (socket as any).user = user;
    next();
  } catch (error) {
    return next(new Error('Token de Mensageria Inválido'));
  }
});

io.on('connection', (socket) => {
  const user = (socket as any).user;

  if (user && user.tenant_id) {
    socket.join(`tenant_${user.tenant_id}`);
  }

  socket.on('disconnect', () => { });
});
