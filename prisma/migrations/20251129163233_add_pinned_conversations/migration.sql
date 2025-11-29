-- AlterTable
ALTER TABLE "conversation_participant" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "position" TEXT;
