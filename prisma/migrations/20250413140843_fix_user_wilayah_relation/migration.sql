/*
  Warnings:

  - You are about to drop the column `createdById` on the `Wilayah` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Wilayah" DROP CONSTRAINT "Wilayah_createdById_fkey";

-- AlterTable
ALTER TABLE "Wilayah" DROP COLUMN "createdById";
