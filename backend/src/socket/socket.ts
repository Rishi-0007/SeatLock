import { Server } from 'socket.io';
import http from 'http';

export let io: Server;

export type SeatEventPayload = {
  seatIds: string[];
  status: 'LOCKED' | 'AVAILABLE' | 'BOOKED';
};

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function initSocket(httpServer: http.Server) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.emit('test:event', {
      message: 'Hello from backend 👋',
    });

    // Join a test run room to receive concurrency test events
    socket.on('join:test', (testRunId: string) => {
      socket.join(testRunId);
      console.log(`📡 ${socket.id} joined test room: ${testRunId}`);
    });

    socket.on('leave:test', (testRunId: string) => {
      socket.leave(testRunId);
      console.log(`📡 ${socket.id} left test room: ${testRunId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
}
