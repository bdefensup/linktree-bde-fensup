-- AlterTable
ALTER TABLE "conversation" ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "isTicket" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "ticketStatus" TEXT NOT NULL DEFAULT 'OPEN';
