/*
  Warnings:

  - The primary key for the `DetailPanti` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `alamatPanti` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `daftarPantiId` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `fokusPelayanPanti` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `jenisSumbangan` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `karakteristikPenghuni` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `kebutuhanBantuan` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `namaPanti` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `nomorKontak` on the `DetailPanti` table. All the data in the column will be lost.
  - You are about to drop the column `yayasanPenaung` on the `DetailPanti` table. All the data in the column will be lost.
  - The `id` column on the `DetailPanti` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `DaftarPanti` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[pantiId]` on the table `DetailPanti` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alamatLengkap` to the `DetailPanti` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deskripsiLengkap` to the `DetailPanti` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fokusPelayanan` to the `DetailPanti` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pantiId` to the `DetailPanti` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `jumlahPenghuni` on the `DetailPanti` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "DaftarPanti" DROP CONSTRAINT "DaftarPanti_penulisId_fkey";

-- DropForeignKey
ALTER TABLE "DaftarPanti" DROP CONSTRAINT "DaftarPanti_wilayahId_fkey";

-- DropForeignKey
ALTER TABLE "DetailPanti" DROP CONSTRAINT "DetailPanti_daftarPantiId_fkey";

-- AlterTable
ALTER TABLE "DetailPanti" DROP CONSTRAINT "DetailPanti_pkey",
DROP COLUMN "alamatPanti",
DROP COLUMN "daftarPantiId",
DROP COLUMN "fokusPelayanPanti",
DROP COLUMN "jenisSumbangan",
DROP COLUMN "karakteristikPenghuni",
DROP COLUMN "kebutuhanBantuan",
DROP COLUMN "namaPanti",
DROP COLUMN "nomorKontak",
DROP COLUMN "yayasanPenaung",
ADD COLUMN     "alamatLengkap" TEXT NOT NULL,
ADD COLUMN     "deskripsiLengkap" TEXT NOT NULL,
ADD COLUMN     "fokusPelayanan" TEXT NOT NULL,
ADD COLUMN     "kategoriKebutuhan" JSONB,
ADD COLUMN     "pantiId" INTEGER NOT NULL,
ADD COLUMN     "sumbanganDiterima" JSONB,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "jumlahPenghuni",
ADD COLUMN     "jumlahPenghuni" JSONB NOT NULL,
ADD CONSTRAINT "DetailPanti_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Wilayah" ADD COLUMN     "provinsi" TEXT;

-- DropTable
DROP TABLE "DaftarPanti";

-- CreateTable
CREATE TABLE "Yayasan" (
    "id" SERIAL NOT NULL,
    "namaYayasan" TEXT NOT NULL,
    "alamatYayasan" TEXT NOT NULL,
    "emailYayasan" TEXT,
    "kontakYayasan" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Yayasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panti" (
    "id" SERIAL NOT NULL,
    "namaPanti" TEXT NOT NULL,
    "fotoUtama" TEXT,
    "deskripsiSingkat" TEXT NOT NULL,
    "jumlahAnak" INTEGER NOT NULL DEFAULT 0,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "yayasanId" INTEGER NOT NULL,
    "wilayahId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panti_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DetailPanti_pantiId_key" ON "DetailPanti"("pantiId");

-- AddForeignKey
ALTER TABLE "Panti" ADD CONSTRAINT "Panti_yayasanId_fkey" FOREIGN KEY ("yayasanId") REFERENCES "Yayasan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panti" ADD CONSTRAINT "Panti_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPanti" ADD CONSTRAINT "DetailPanti_pantiId_fkey" FOREIGN KEY ("pantiId") REFERENCES "Panti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
