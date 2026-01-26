import { redis } from './client';

const LOCK_TTL_SECONDS = 120;

export function seatLockKey(seatId: string) {
  return `seat:lock:${seatId}`;
}

export async function setSeatTTL(seatId: string, userId: string) {
  await redis.set(seatLockKey(seatId), userId, {
    EX: LOCK_TTL_SECONDS,
    NX: true,
  });
}

export async function getSeatTTL(seatId: string) {
  return redis.ttl(seatLockKey(seatId));
}

export async function seatTTLExists(seatId: string) {
  return (await redis.exists(seatLockKey(seatId))) === 1;
}

export async function clearSeatTTL(seatId: string) {
  await redis.del(seatLockKey(seatId));
}

export async function getSeatLockOwner(seatId: string) {
  return redis.get(seatLockKey(seatId));
}
