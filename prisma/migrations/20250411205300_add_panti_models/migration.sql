-- CreateTable
CREATE TABLE "DaftarPanti" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "subjudul" TEXT,
    "gambarUrl" TEXT,
    "konten" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "penulisId" TEXT NOT NULL,

    CONSTRAINT "DaftarPanti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPanti" (
    "id" TEXT NOT NULL,
    "namaPanti" TEXT NOT NULL,
    "yayasanPenaung" TEXT NOT NULL,
    "fokusPelayanPanti" TEXT NOT NULL,
    "alamatPanti" TEXT NOT NULL,
    "jumlahPengasuh" INTEGER NOT NULL,
    "jumlahPenghuni" INTEGER NOT NULL,
    "karakteristikPenghuni" TEXT,
    "jenisSumbangan" TEXT,
    "kebutuhanBantuan" TEXT,
    "nomorKontak" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "daftarPantiId" TEXT NOT NULL,

    CONSTRAINT "DetailPanti_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DaftarPanti" ADD CONSTRAINT "DaftarPanti_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPanti" ADD CONSTRAINT "DetailPanti_daftarPantiId_fkey" FOREIGN KEY ("daftarPantiId") REFERENCES "DaftarPanti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
