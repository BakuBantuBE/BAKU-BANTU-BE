const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateRandomProvinsi = () => {
  const provinces = [
    'Jawa Barat Testing', 'DKI Jakarta Testing', 'Jawa Timur Testing',
    'Sumatera Utara Testing', 'Sulawesi Selatan Testing', 'Jawa Tengah Testing',
    'Sumatera Selatan Testing', 'Banten Testing', 'Kepulauan Riau Testing'
  ];
  return provinces[Math.floor(Math.random() * provinces.length)];
};

async function createWilayahData() {
  try {
    const wilayahName = `Wilayah_Testing_${Date.now()}`;
    const newWilayah = await prisma.wilayah.create({
      data: {
        nama: wilayahName,
        provinsi: generateRandomProvinsi(),
        status: 'INACTIVE'
      }
    });
    console.log(`Wilayah baru dibuat: ${newWilayah.nama} (ID: ${newWilayah.id}) pada ${new Date().toISOString()}`);
    return newWilayah;
  } catch (error) {
    console.error("Gagal membuat data Wilayah:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Vercel Cron: Inject wilayah triggered pada:", new Date().toISOString());
    const result = await createWilayahData();

    res.status(200).json({
      success: true,
      message: 'Wilayah injection completed',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}