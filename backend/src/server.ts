import app from './app';
import { connectRedis } from './redis/client';

const PORT = process.env.PORT || 5000;

(async () => {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
