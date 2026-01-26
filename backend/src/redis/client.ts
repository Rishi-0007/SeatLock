import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
};
