const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let injectedWilayahIds = [];

const generateRandomWilayahName = () => {
  const cities = [
    'Bandung Testing', 'Jakarta Testing', 'Surabaya Testing', 
    'Medan Testing', 'Makassar Testing', 'Semarang Testing',
    'Palembang Testing', 'Tangerang Testing', 'Depok Testing',
    'Bekasi Testing', 'Solo Testing', 'Batam Testing'
  ];
  const suffix = Math.random().toString(36).substring(2, 8);
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  return `${randomCity} ${suffix}`;
};

const generateRandomProvinsi = () => {
  const provinces = [
    'Jawa Barat Testing', 'DKI Jakarta Testing', 'Jawa Timur Testing',
    'Sumatera Utara Testing', 'Sulawesi Selatan Testing', 'Jawa Tengah Testing',
    'Sumatera Selatan Testing', 'Banten Testing', 'Kepulauan Riau Testing'
  ];
  return provinces[Math.floor(Math.random() * provinces.length)];
};

const injectRandomWilayah = async () => {
  try {
    console.log('🚀 Starting wilayah injection...');
    
    const wilayahData = [];
    for (let i = 0; i < 3; i++) {
      wilayahData.push({
        nama: generateRandomWilayahName(),
        provinsi: generateRandomProvinsi(),
        status: 'INACTIVE'
      });
    }

    const createdWilayah = await prisma.wilayah.createMany({
      data: wilayahData,
      skipDuplicates: true
    });

    // Get the IDs of newly created wilayah with INACTIVE status
    const recentInactiveWilayah = await prisma.wilayah.findMany({
      where: {
        status: 'INACTIVE',
        createdAt: {
          gte: new Date(Date.now() - 60000) // Created in the last minute
        }
      },
      select: {
        id: true,
        nama: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    const newIds = recentInactiveWilayah.map(w => w.id);
    injectedWilayahIds.push(...newIds);

    console.log(`✅ Successfully injected ${createdWilayah.count} wilayah with INACTIVE status`);
    console.log('📝 Injected wilayah:', recentInactiveWilayah.map(w => `ID: ${w.id}, Name: ${w.nama}`));
    console.log('🗂️ Current tracked IDs:', injectedWilayahIds);

  } catch (error) {
    console.error('❌ Error injecting wilayah:', error);
  }
};

const cleanupInjectedWilayah = async () => {
  try {
    if (injectedWilayahIds.length === 0) {
      console.log('🧹 No wilayah to cleanup');
      return;
    }

    console.log('🗑️ Starting cleanup of injected wilayah...');
    console.log('🎯 Cleaning up IDs:', injectedWilayahIds);

    // Only delete wilayah that don't have any related volunteers or pantis
    const wilayahToDelete = await prisma.wilayah.findMany({
      where: {
        id: {
          in: injectedWilayahIds
        },
        status: 'INACTIVE',
        volunteers: {
          none: {}
        },
        pantis: {
          none: {}
        }
      }
    });

    if (wilayahToDelete.length > 0) {
      const deleteResult = await prisma.wilayah.deleteMany({
        where: {
          id: {
            in: wilayahToDelete.map(w => w.id)
          }
        }
      });

      console.log(`✅ Successfully deleted ${deleteResult.count} wilayah`);
      console.log('🗑️ Deleted wilayah:', wilayahToDelete.map(w => `ID: ${w.id}, Name: ${w.nama}`));

      // Remove deleted IDs from tracking array
      const deletedIds = wilayahToDelete.map(w => w.id);
      injectedWilayahIds = injectedWilayahIds.filter(id => !deletedIds.includes(id));
    } else {
      console.log('⚠️ No wilayah can be deleted (might have relations or already deleted)');
    }

    console.log('🗂️ Remaining tracked IDs:', injectedWilayahIds);

  } catch (error) {
    console.error('❌ Error cleaning up wilayah:', error);
  }
};

const startCronJobs = () => {
  console.log('⏰ Starting cron jobs for wilayah testing...');
  
  // Inject 3 random wilayah every 5 hours
  cron.schedule('0 */5 * * *', () => {
    console.log('\n⏰ Cron job triggered: Injecting wilayah data');
    injectRandomWilayah();
  });

  // Cleanup injected wilayah 2 minutes after injection (runs every 2 minutes)
  cron.schedule('*/2 * * * *', () => {
    console.log('\n⏰ Cron job triggered: Cleaning up wilayah data');
    cleanupInjectedWilayah();
  });

  console.log('✅ Cron jobs started successfully');
  console.log('📋 Schedule:');
  console.log('   - Inject 3 INACTIVE wilayah: Every 5 hours');
  console.log('   - Cleanup injected wilayah: Every 2 minutes');
};

const stopCronJobs = () => {
  console.log('⏹️ Stopping all cron jobs...');
  cron.destroy();
  console.log('✅ All cron jobs stopped');
};

// Manual functions for testing
const manualInject = () => {
  console.log('🔧 Manual injection triggered');
  return injectRandomWilayah();
};

const manualCleanup = () => {
  console.log('🔧 Manual cleanup triggered');
  return cleanupInjectedWilayah();
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