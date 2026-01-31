-- CreateEnum
CREATE TYPE "TestRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL,
    "totalUsers" INTEGER NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "status" "TestRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualUser" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VirtualUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSeat" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,

    CONSTRAINT "TestSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSeatLock" (
    "seatId" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSeatLock_pkey" PRIMARY KEY ("seatId")
);

-- CreateTable
CREATE TABLE "TestBooking" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "seatRow" TEXT NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestSeat_testRunId_row_number_key" ON "TestSeat"("testRunId", "row", "number");

-- AddForeignKey
ALTER TABLE "VirtualUser" ADD CONSTRAINT "VirtualUser_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSeat" ADD CONSTRAINT "TestSeat_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSeatLock" ADD CONSTRAINT "TestSeatLock_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "TestSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSeatLock" ADD CONSTRAINT "TestSeatLock_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "VirtualUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestBooking" ADD CONSTRAINT "TestBooking_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestBooking" ADD CONSTRAINT "TestBooking_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "VirtualUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
