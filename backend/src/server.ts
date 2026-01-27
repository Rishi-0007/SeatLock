import http from 'http';
import app from './app';
import { connectRedis } from './redis/client';
import { initSocket } from './socket';

const PORT = process.env.PORT || 5000;

(async () => {
  await connectRedis();

  const httpServer = http.createServer(app);

  // initialize socket.io
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server + Socket.io running on http://localhost:${PORT}`);
  });
})();
