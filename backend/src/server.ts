import http from 'http';
import app from './app';
import { connectRedis } from './redis/client';
import { initSocket } from './socket/socket';
import { cleanupExpiredSeatLocks } from './workers/seatCleanup.worker';

const PORT = process.env.PORT || 5000;

(async () => {
  const httpServer = http.createServer(app);

  // Connect to Redis
  await connectRedis();

  // Initialize Socket.io
  initSocket(httpServer);

  // Start periodic seat cleanup worker
  setInterval(() => {
    cleanupExpiredSeatLocks();
  }, 60 * 1000);

  // Start HTTP + Socket.io server
  httpServer.listen(PORT, () => {
    console.log(`Server + Socket.io running on http://localhost:${PORT}`);
  });
})();
