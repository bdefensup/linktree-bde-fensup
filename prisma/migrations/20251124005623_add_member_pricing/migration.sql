-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "isMember" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "externalMemberPaymentLink" TEXT,
ADD COLUMN     "externalPaymentLink" TEXT,
ADD COLUMN     "memberPrice" DOUBLE PRECISION;
