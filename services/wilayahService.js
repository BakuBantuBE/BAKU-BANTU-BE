const prisma = require('../configs/prisma');

// Function to add a new region
const createWilayah = async (nama, userId) => {
  try {
    // Check if a region with the same name already exists
    const existingWilayah = await prisma.wilayah.findUnique({
      where: { nama }
    });

    if (existingWilayah) {
      throw new Error('Wilayah dengan nama tersebut sudah ada');
    }

    // Create a new region with ACTIVE status by default
    const wilayah = await prisma.wilayah.create({
      data: {
        nama,
        status: 'ACTIVE' // Set status to ACTIVE by default
      }
    });

    return wilayah;
  } catch (error) {
    throw error;
  }
};

// Updated getAllWilayah function
const getAllWilayah = async () => {
  try {
    // Get all wilayah records
    const wilayahs = await prisma.wilayah.findMany({
      orderBy: {
        nama: 'asc'
      }
    });
    
    // For each wilayah, get volunteer count and names
    const wilayahsWithCounts = await Promise.all(wilayahs.map(async (wilayah) => {
      // Count volunteers in this wilayah
      const volunteersCount = await prisma.volunteer.count({
        where: {
          wilayahId: wilayah.id
        }
      });
      
      
      // Return wilayah with volunteer data
      // totalCount is now just the volunteersCount
      return {
        ...wilayah,
        volunteersCount,
        totalCount: volunteersCount,
      };
    }));
    
    return wilayahsWithCounts;
  } catch (error) {
    throw error;
  }
};

// Function to get active wilayah without authentication
const getActiveWilayah = async () => {
  try {
    // Get all active wilayah records
    const wilayahs = await prisma.wilayah.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        nama: 'asc'
      }
    });
    
    return wilayahs;
  } catch (error) {
    throw error;
  }
};

// Function to get a region by ID
const getWilayahById = async (wilayahId) => {
  try {
    // Convert wilayahId to integer
    const wilayahIdInt = parseInt(wilayahId);
    
    // Check if the conversion resulted in a valid number
    if (isNaN(wilayahIdInt)) {
      throw new Error('ID wilayah tidak valid');
    }
    
    const wilayah = await prisma.wilayah.findUnique({
      where: { id: wilayahIdInt },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        daftarPantis: true
      }
    });

    if (!wilayah) {
      throw new Error('Wilayah tidak ditemukan');
    }

    return wilayah;
  } catch (error) {
    throw error;
  }
};

// Function to delete a region
const deleteWilayah = async (wilayahId) => {
  try {
    // Convert wilayahId to integer
    const wilayahIdInt = parseInt(wilayahId);
    
    // Check if the conversion resulted in a valid number
    if (isNaN(wilayahIdInt)) {
      throw new Error('ID wilayah tidak valid');
    }
    
    // Check if the region exists
    const wilayah = await prisma.wilayah.findUnique({
      where: { id: wilayahIdInt },
      include: {
        daftarPantis: true
      }
    });

    if (!wilayah) {
      throw new Error('Wilayah tidak ditemukan');
    }

    // Check if the region has associated orphanage lists
    if (wilayah.daftarPantis.length > 0) {
      throw new Error('Tidak dapat menghapus wilayah yang memiliki daftar panti terkait');
    }

    // Delete the region
    const deletedWilayah = await prisma.wilayah.delete({
      where: { id: wilayahIdInt }
    });

    return deletedWilayah;
  } catch (error) {
    throw error;
  }
};


// Function to update the region of an orphanage list
const updateDaftarPantiWilayah = async (daftarPantiId, wilayahId) => {
  try {
    // Convert daftarPantiId to integer
    const daftarPantiIdInt = parseInt(daftarPantiId);
    
    // Check if the conversion resulted in a valid number
    if (isNaN(daftarPantiIdInt)) {
      throw new Error('ID daftar panti tidak valid');
    }
    
    // Check if the orphanage list exists
    const daftarPanti = await prisma.daftarPanti.findUnique({
      where: { id: daftarPantiIdInt }
    });

    if (!daftarPanti) {
      throw new Error('Daftar panti tidak ditemukan');
    }

    // Convert wilayahId to integer if it's not null
    let wilayahIdInt = null;
    if (wilayahId) {
      wilayahIdInt = parseInt(wilayahId);
      
      // Check if the conversion resulted in a valid number
      if (isNaN(wilayahIdInt)) {
        throw new Error('ID wilayah tidak valid');
      }
      
      // Check if the region exists
      const wilayah = await prisma.wilayah.findUnique({
        where: { id: wilayahIdInt }
      });

      if (!wilayah) {
        throw new Error('Wilayah tidak ditemukan');
      }
    }

    // Update the region of the orphanage list
    const updatedDaftarPanti = await prisma.daftarPanti.update({
      where: { id: daftarPantiIdInt },
      data: { wilayahId: wilayahIdInt }
    });

    return updatedDaftarPanti;
  } catch (error) {
    throw error;
  }
};

// Function to update wilayah status
const updateWilayahStatus = async (wilayahId, status) => {
  try {
    // Convert wilayahId to integer
    const wilayahIdInt = parseInt(wilayahId);
    
    // Check if the conversion resulted in a valid number
    if (isNaN(wilayahIdInt)) {
      throw new Error('ID wilayah tidak valid');
    }
    
    // Check if the region exists
    const wilayah = await prisma.wilayah.findUnique({
      where: { id: wilayahIdInt }
    });

    if (!wilayah) {
      throw new Error('Wilayah tidak ditemukan');
    }

    // Update the status
    const updatedWilayah = await prisma.wilayah.update({
      where: { id: wilayahIdInt },
      data: { status }
    });

    return updatedWilayah;
  } catch (error) {
    throw error;
  }
};

// Function to update a region (name and status)
const updateWilayah = async (wilayahId, updateData) => {
  try {
    // Convert wilayahId to integer
    const wilayahIdInt = parseInt(wilayahId);
    
    // Check if the conversion resulted in a valid number
    if (isNaN(wilayahIdInt)) {
      throw new Error('ID wilayah tidak valid');
    }
    
    // Check if the region exists
    const wilayah = await prisma.wilayah.findUnique({
      where: { id: wilayahIdInt }
    });

    if (!wilayah) {
      throw new Error('Wilayah tidak ditemukan');
    }

    // Check if new name already exists (if name is being updated)
    if (updateData.nama && updateData.nama !== wilayah.nama) {
      const existingWilayah = await prisma.wilayah.findUnique({
        where: { nama: updateData.nama }
      });

      if (existingWilayah) {
        throw new Error('Wilayah dengan nama tersebut sudah ada');
      }
    }

    // Validate status if provided
    if (updateData.status && !['ACTIVE', 'INACTIVE'].includes(updateData.status)) {
      throw new Error('Status tidak valid. Gunakan ACTIVE atau INACTIVE');
    }

    // Update the wilayah
    const updatedWilayah = await prisma.wilayah.update({
      where: { id: wilayahIdInt },
      data: {
        nama: updateData.nama || wilayah.nama,
        status: updateData.status || wilayah.status
      }
    });

    return updatedWilayah;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createWilayah,
  getAllWilayah,
  getActiveWilayah,
  getWilayahById,
  deleteWilayah,
  updateDaftarPantiWilayah,
  updateWilayahStatus,
  updateWilayah
};