const prisma = require('../configs/prisma');

// Function to create a new yayasan
const createYayasan = async (data) => {
  try {
    // Check if yayasan with same name already exists
    const existingYayasan = await prisma.yayasan.findFirst({
      where: {
        namaYayasan: data.namaYayasan
      }
    });

    if (existingYayasan) {
      throw new Error('Yayasan dengan nama tersebut sudah ada');
    }

    // Create a new yayasan
    const yayasan = await prisma.yayasan.create({
      data: {
        namaYayasan: data.namaYayasan,
        alamatYayasan: data.alamatYayasan,
        emailYayasan: data.emailYayasan || null,
        kontakYayasan: data.kontakYayasan || null,
        status: 'ACTIVE'
      }
    });

    return yayasan;
  } catch (error) {
    throw error;
  }
};

// Function to get all yayasan
const getAllYayasan = async () => {
  try {
    const yayasans = await prisma.yayasan.findMany({
      orderBy: {
        namaYayasan: 'asc'
      },
      include: {
        pantis: {
          select: {
            id: true,
            namaPanti: true
          }
        }
      }
    });

    // Add count of pantis for each yayasan
    const yayasansWithCounts = yayasans.map(yayasan => ({
      ...yayasan,
      pantiCount: yayasan.pantis.length
    }));

    return yayasansWithCounts;
  } catch (error) {
    throw error;
  }
};

// Function to get active yayasan
const getActiveYayasan = async () => {
  try {
    const yayasans = await prisma.yayasan.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        namaYayasan: 'asc'
      },
      select: {
        id: true,
        namaYayasan: true,
        alamatYayasan: true,
        emailYayasan: true,
        kontakYayasan: true
      }
    });

    return yayasans;
  } catch (error) {
    throw error;
  }
};

// Function to get a yayasan by ID
const getYayasanById = async (yayasanId) => {
  try {
    const yayasanIdInt = parseInt(yayasanId);
    
    if (isNaN(yayasanIdInt)) {
      throw new Error('ID yayasan tidak valid');
    }
    
    const yayasan = await prisma.yayasan.findUnique({
      where: { id: yayasanIdInt },
      include: {
        pantis: {
          include: {
            wilayah: true,
            detailPanti: true
          }
        }
      }
    });

    if (!yayasan) {
      throw new Error('Yayasan tidak ditemukan');
    }

    return yayasan;
  } catch (error) {
    throw error;
  }
};

// Function to update a yayasan
const updateYayasan = async (yayasanId, data) => {
  try {
    const yayasanIdInt = parseInt(yayasanId);
    
    if (isNaN(yayasanIdInt)) {
      throw new Error('ID yayasan tidak valid');
    }
    
    // Check if yayasan exists
    const yayasan = await prisma.yayasan.findUnique({
      where: { id: yayasanIdInt }
    });

    if (!yayasan) {
      throw new Error('Yayasan tidak ditemukan');
    }

    // Check if new name already exists (if name is being updated)
    if (data.namaYayasan && data.namaYayasan !== yayasan.namaYayasan) {
      const existingYayasan = await prisma.yayasan.findFirst({
        where: {
          namaYayasan: data.namaYayasan,
          id: { not: yayasanIdInt }
        }
      });

      if (existingYayasan) {
        throw new Error('Yayasan dengan nama tersebut sudah ada');
      }
    }

    // Update the yayasan
    const updatedYayasan = await prisma.yayasan.update({
      where: { id: yayasanIdInt },
      data: {
        namaYayasan: data.namaYayasan || yayasan.namaYayasan,
        alamatYayasan: data.alamatYayasan || yayasan.alamatYayasan,
        emailYayasan: data.emailYayasan !== undefined ? data.emailYayasan : yayasan.emailYayasan,
        kontakYayasan: data.kontakYayasan !== undefined ? data.kontakYayasan : yayasan.kontakYayasan,
        status: data.status || yayasan.status
      }
    });

    return updatedYayasan;
  } catch (error) {
    throw error;
  }
};

// Function to delete a yayasan
const deleteYayasan = async (yayasanId) => {
  try {
    const yayasanIdInt = parseInt(yayasanId);
    
    if (isNaN(yayasanIdInt)) {
      throw new Error('ID yayasan tidak valid');
    }
    
    // Check if yayasan exists
    const yayasan = await prisma.yayasan.findUnique({
      where: { id: yayasanIdInt },
      include: {
        pantis: true
      }
    });

    if (!yayasan) {
      throw new Error('Yayasan tidak ditemukan');
    }

    // Check if yayasan has pantis
    if (yayasan.pantis.length > 0) {
      throw new Error('Tidak dapat menghapus yayasan yang memiliki panti terkait');
    }

    // Delete the yayasan
    const deletedYayasan = await prisma.yayasan.delete({
      where: { id: yayasanIdInt }
    });

    return deletedYayasan;
  } catch (error) {
    throw error;
  }
};

// Function to update yayasan status
const updateYayasanStatus = async (yayasanId, status) => {
  try {
    const yayasanIdInt = parseInt(yayasanId);
    
    if (isNaN(yayasanIdInt)) {
      throw new Error('ID yayasan tidak valid');
    }
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new Error('Status tidak valid. Gunakan ACTIVE atau INACTIVE');
    }
    
    // Check if yayasan exists
    const yayasan = await prisma.yayasan.findUnique({
      where: { id: yayasanIdInt }
    });

    if (!yayasan) {
      throw new Error('Yayasan tidak ditemukan');
    }

    // Update the yayasan status
    const updatedYayasan = await prisma.yayasan.update({
      where: { id: yayasanIdInt },
      data: { status: status }
    });

    return updatedYayasan;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createYayasan,
  getAllYayasan,
  getActiveYayasan,
  getYayasanById,
  updateYayasan,
  deleteYayasan,
  updateYayasanStatus
};