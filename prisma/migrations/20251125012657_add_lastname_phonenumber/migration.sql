/*
  Warnings:

  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event" ADD COLUMN     "externalPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "role";
