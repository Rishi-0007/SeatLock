/*
  Warnings:

  - You are about to drop the column `lockedBy` on the `Seat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "expiresAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "lockedBy",
ADD COLUMN     "lockedByUserId" TEXT;
