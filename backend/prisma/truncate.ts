import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function truncateAllTables() {
  console.log('🗑️  Truncating all tables...\n');

  // Order matters due to foreign key constraints
  // Delete from child tables first, then parent tables

  // Test-related tables (cascade should handle these, but explicit is safer)
  await prisma.testBooking.deleteMany();
  await prisma.testSeatLock.deleteMany();
  await prisma.testSeat.deleteMany();
  await prisma.virtualUser.deleteMany();
  await prisma.testRun.deleteMany();
  console.log('✅ Test tables truncated');

  // Main application tables
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Main tables truncated');

  console.log('\n🎉 All tables truncated successfully!');
  console.log('   Schema preserved. Run `npx prisma db seed` to re-seed data.');
}

truncateAllTables()
  .catch((e) => {
    console.error('❌ Error truncating tables:', e);
    // process.exit(1);
  })
  .finally(() => prisma.$disconnect());
