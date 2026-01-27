import http from 'http';
import app from './app';
import { connectRedis } from './redis/client';
import { initSocket } from './socket/socket';
import { startSeatExpiryListener } from './redis/seatExpiryListener';

const PORT = process.env.PORT || 5000;

(async () => {
  // Connect to Redis
  await connectRedis();
  startSeatExpiryListener();

  const httpServer = http.createServer(app);
  // Initialize Socket.io
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server + Socket.io running on http://localhost:${PORT}`);
  });
})();
