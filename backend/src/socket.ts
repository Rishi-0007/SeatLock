import { Server } from 'socket.io';
import http from 'http';

export let io: Server;

export function initSocket(httpServer: http.Server) {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000', // frontend URL
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.emit('test:event', {
      message: 'Hello from backend 👋',
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
}
