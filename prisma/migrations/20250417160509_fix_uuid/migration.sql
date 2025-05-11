/*
  Warnings:

  - The primary key for the `Wilayah` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Wilayah` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `wilayahId` to the `DaftarPanti` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wilayahId` to the `Volunteer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DaftarPanti" DROP CONSTRAINT "DaftarPanti_wilayahId_fkey";

-- DropForeignKey
ALTER TABLE "Volunteer" DROP CONSTRAINT "Volunteer_wilayahId_fkey";

-- AlterTable
ALTER TABLE "DaftarPanti" DROP COLUMN "wilayahId",
ADD COLUMN     "wilayahId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "wilayahId",
ADD COLUMN     "wilayahId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Wilayah" DROP CONSTRAINT "Wilayah_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Wilayah_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaftarPanti" ADD CONSTRAINT "DaftarPanti_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
