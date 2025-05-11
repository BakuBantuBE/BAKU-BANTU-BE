/*
  Warnings:

  - The `jenisSumbangan` column on the `DetailPanti` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "DaftarPanti" ADD COLUMN     "wilayahId" TEXT;

-- AlterTable
ALTER TABLE "DetailPanti" DROP COLUMN "jenisSumbangan",
ADD COLUMN     "jenisSumbangan" JSONB;

-- CreateTable
CREATE TABLE "Wilayah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wilayah_nama_key" ON "Wilayah"("nama");

-- AddForeignKey
ALTER TABLE "Wilayah" ADD CONSTRAINT "Wilayah_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaftarPanti" ADD CONSTRAINT "DaftarPanti_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
