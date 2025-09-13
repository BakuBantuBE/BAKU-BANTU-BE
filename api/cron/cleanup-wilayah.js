const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupWilayahData() {
  try {
    // Cari wilayah testing yang tidak memiliki relasi
    const wilayahToDelete = await prisma.wilayah.findMany({
      where: {
        nama: { contains: 'Wilayah_Testing_' },
        status: 'INACTIVE',
        volunteers: { none: {} },
        pantis: { none: {} }
      }
    });

    if (wilayahToDelete.length > 0) {
      const deletedCount = await prisma.wilayah.deleteMany({
        where: {
          id: { in: wilayahToDelete.map(w => w.id) }
        }
      });

      console.log(`${deletedCount.count} wilayah testing dihapus pada ${new Date().toISOString()}`);
      return { deletedCount: deletedCount.count, deletedItems: wilayahToDelete };
    } else {
      console.log('Tidak ada wilayah testing yang bisa dihapus');
      return { deletedCount: 0, deletedItems: [] };
    }
  } catch (error) {
    console.error('Gagal menghapus data Wilayah:', error.message);
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
    console.log("Vercel Cron: Cleanup wilayah triggered pada:", new Date().toISOString());
    const result = await cleanupWilayahData();

    res.status(200).json({
      success: true,
      message: 'Wilayah cleanup completed',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cleanup cron job error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}