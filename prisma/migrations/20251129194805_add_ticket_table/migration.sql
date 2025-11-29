/*
  Warnings:

  - You are about to drop the column `guestName` on the `conversation` table. All the data in the column will be lost.
  - You are about to drop the column `isTicket` on the `conversation` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `conversation` table. All the data in the column will be lost.
  - You are about to drop the column `ticketStatus` on the `conversation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- AlterTable
ALTER TABLE "conversation" DROP COLUMN "guestName",
DROP COLUMN "isTicket",
DROP COLUMN "subject",
DROP COLUMN "ticketStatus";

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "guestName" TEXT,
    "guestEmail" TEXT,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_conversationId_key" ON "ticket"("conversationId");

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
