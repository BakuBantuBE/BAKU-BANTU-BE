const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let injectedWilayahIds = [];

const generateRandomProvinsi = () => {
  const provinces = [
    'Jawa Barat Testing', 'DKI Jakarta Testing', 'Jawa Timur Testing',
    'Sumatera Utara Testing', 'Sulawesi Selatan Testing', 'Jawa Tengah Testing',
    'Sumatera Selatan Testing', 'Banten Testing', 'Kepulauan Riau Testing'
  ];
  return provinces[Math.floor(Math.random() * provinces.length)];
};

// Fungsi untuk membuat data Wilayah baru
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
    
    // Tambahkan ke tracking array
    injectedWilayahIds.push(newWilayah.id);
    
  } catch (error) {
    console.error("Gagal membuat data Wilayah:", error.message);
  }
}

// Fungsi untuk cleanup wilayah
async function cleanupWilayahData() {
  try {
    if (injectedWilayahIds.length === 0) {
      console.log('Tidak ada wilayah yang perlu dihapus');
      return;
    }

    // Hapus wilayah yang tidak memiliki relasi
    const wilayahToDelete = await prisma.wilayah.findMany({
      where: {
        id: { in: injectedWilayahIds },
        status: 'INACTIVE',
        volunteers: { none: {} },
        pantis: { none: {} }
      }
    });

    if (wilayahToDelete.length > 0) {
      for (const wilayah of wilayahToDelete) {
        await prisma.wilayah.delete({
          where: { id: wilayah.id }
        });
        console.log(`Wilayah dihapus: ${wilayah.nama} (ID: ${wilayah.id}) pada ${new Date().toISOString()}`);
        
        // Remove from tracking array
        injectedWilayahIds = injectedWilayahIds.filter(id => id !== wilayah.id);
      }
    } else {
      console.log('Tidak ada wilayah yang bisa dihapus (mungkin memiliki relasi)');
    }
  } catch (error) {
    console.error('Gagal menghapus data Wilayah:', error.message);
  }
}

const startCronJobs = () => {
  // Cronjob untuk membuat data Wilayah setiap 1 menit
  cron.schedule("*/1 * * * *", () => {
    console.log("Cronjob triggered pada:", new Date().toISOString());
    createWilayahData();
  }, {
    scheduled: true,
    timezone: "Asia/Jakarta"
  });

  // Cronjob untuk cleanup setiap 2 menit
  cron.schedule("*/2 * * * *", () => {
    console.log("Cleanup cronjob triggered pada:", new Date().toISOString());
    cleanupWilayahData();
  }, {
    scheduled: true,
    timezone: "Asia/Jakarta"
  });

  console.log("Cronjob untuk membuat data Wilayah setiap 1 menit telah diaktifkan");
  console.log("Cronjob untuk cleanup Wilayah setiap 2 menit telah diaktifkan");
  
  // Test immediate injection
  setTimeout(() => {
    console.log("Test injection dimulai pada:", new Date().toISOString());
    createWilayahData();
  }, 5000);
};

const stopCronJobs = () => {
  console.log('⏹️ Stopping all cron jobs...');
  cron.destroy();
  console.log('✅ All cron jobs stopped');
};

// Manual functions for testing
const manualInject = () => {
  console.log('🔧 Manual injection triggered');
  return createWilayahData();
};

const manualCleanup = () => {
  console.log('🔧 Manual cleanup triggered');
  return cleanupWilayahData();
};

const getTrackedIds = () => {
  return injectedWilayahIds;
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  manualInject,
  manualCleanup,
  getTrackedIds
};