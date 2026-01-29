import { SeatStatus } from '@prisma/client';
import { prisma } from '../src/prisma/client';

async function main() {
  console.log('🌱 Starting seed...');

  // 1️⃣ Clean existing data (FK-safe order)
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // 2️⃣ Create demo user
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demouser@seatlock.dev',
      password: 'password123', // In a real app, hash this!
    },
  });

  // 3️⃣ Create event
  const event = await prisma.event.create({
    data: {
      name: 'Avengers: Endgame',
      date: new Date('2026-02-12T19:30:00Z'),
      imageUrl: 'https://lh3.googleusercontent.com/d/1pY0CPzfrgwC8pCgINYgywxPdJjZKQcbq', // Direct link to the image
    },
  });

  // 4️⃣ Generate deterministic seats (A1 → J10)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seats = [];

  for (const row of rows) {
    for (let number = 1; number <= 10; number++) {
      seats.push({
        row,
        number,
        status: SeatStatus.AVAILABLE,
        eventId: event.id,
      });
    }
  }

  // 5️⃣ Insert seats in bulk
  await prisma.seat.createMany({
    data: seats,
  });

  console.log(`✅ Seed complete`);
  console.log(`👤 User: ${user.email}`);
  console.log(`🎭 Event: ${event.name}`);
  console.log(`💺 Seats created: ${seats.length}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
