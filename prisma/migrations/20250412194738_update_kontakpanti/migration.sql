/*
  Warnings:

  - The `nomorKontak` column on the `DetailPanti` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DetailPanti" DROP COLUMN "nomorKontak",
ADD COLUMN     "nomorKontak" JSONB;
