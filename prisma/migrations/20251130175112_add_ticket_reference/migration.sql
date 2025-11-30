/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ticket" ADD COLUMN     "reference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ticket_reference_key" ON "ticket"("reference");
