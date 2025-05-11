const prisma = require('../configs/prisma');
const imagekit = require('../configs/imagekit');

// Updated function to create a new panti with detail in one step
const createPanti = async (data, userId, fotoFile = null) => {
  try {
    // Validate required fields for panti
    if (!data.namaPanti || !data.deskripsiSingkat || !data.yayasanId || !data.wilayahId) {
      throw new Error('Nama panti, deskripsi singkat, ID yayasan, dan ID wilayah wajib diisi');
    }

    // Check if yayasan exists
    const yayasan = await prisma.yayasan.findUnique({
      where: { id: parseInt(data.yayasanId) }
    });

    if (!yayasan) {
      throw new Error('Yayasan tidak ditemukan');
    }

    // Check if wilayah exists
    const wilayah = await prisma.wilayah.findUnique({
      where: { id: parseInt(data.wilayahId) }
    });

    if (!wilayah) {
      throw new Error('Wilayah tidak ditemukan');
    }

    let fotoUrl = null;
    
    // Upload photo to ImageKit if provided
    if (fotoFile) {
      try {
        const fileContent = fotoFile.buffer.toString('base64');
        
        const uploadResponse = await imagekit.upload({
          file: fileContent,
          fileName: `panti-${Date.now()}`,
          folder: '/panti-photos'
        });
        
        fotoUrl = uploadResponse.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload panti image');
      }
    }

    // Create a new panti with transaction to ensure both panti and detail are created together
    const result = await prisma.$transaction(async (prisma) => {
      // Create the panti first
      const panti = await prisma.panti.create({
        data: {
          namaPanti: data.namaPanti,
          fotoUtama: fotoUrl,
          deskripsiSingkat: data.deskripsiSingkat,
          status: 'ACTIVE',
          yayasanId: parseInt(data.yayasanId),
          wilayahId: parseInt(data.wilayahId)
        }
      });

      // Prepare default values for detailPanti
      let jumlahPenghuni = { laki_laki: 0, perempuan: 0 };
      if (data.jumlahPenghuni) {
        if (typeof data.jumlahPenghuni === 'string') {
          try {
            jumlahPenghuni = JSON.parse(data.jumlahPenghuni);
          } catch (e) {
            jumlahPenghuni = { laki_laki: 0, perempuan: 0 };
          }
        } else {
          jumlahPenghuni = data.jumlahPenghuni;
        }
      }

      let kategoriKebutuhan = [];
      if (data.kategoriKebutuhan) {
        if (typeof data.kategoriKebutuhan === 'string') {
          try {
            kategoriKebutuhan = JSON.parse(data.kategoriKebutuhan);
          } catch (e) {
            kategoriKebutuhan = data.kategoriKebutuhan.split(',').map(item => item.trim());
          }
        } else {
          kategoriKebutuhan = data.kategoriKebutuhan;
        }
      }

      let sumbanganDiterima = [];
      if (data.sumbanganDiterima) {
        if (typeof data.sumbanganDiterima === 'string') {
          try {
            sumbanganDiterima = JSON.parse(data.sumbanganDiterima);
          } catch (e) {
            sumbanganDiterima = data.sumbanganDiterima.split(',').map(item => item.trim());
          }
        } else {
          sumbanganDiterima = data.sumbanganDiterima;
        }
      }

      // Calculate total anak
      const totalAnak = 
        (typeof jumlahPenghuni.laki_laki === 'number' ? jumlahPenghuni.laki_laki : 0) + 
        (typeof jumlahPenghuni.perempuan === 'number' ? jumlahPenghuni.perempuan : 0);
      
      // Update jumlahAnak in panti
      await prisma.panti.update({
        where: { id: panti.id },
        data: { jumlahAnak: totalAnak }
      });

      // Create detailPanti with default values
      const detailPanti = await prisma.detailPanti.create({
        data: {
          fokusPelayanan: data.fokusPelayanan || 'Umum',
          alamatLengkap: data.alamatLengkap || '',
          deskripsiLengkap: data.deskripsiLengkap || data.deskripsiSingkat || '',
          jumlahPengasuh: data.jumlahPengasuh ? parseInt(data.jumlahPengasuh) : 0,
          jumlahPenghuni: jumlahPenghuni,
          kategoriKebutuhan: kategoriKebutuhan,
          sumbanganDiterima: sumbanganDiterima,
          pantiId: panti.id
        }
      });

      // Return complete panti with detail
      return {
        ...panti,
        detailPanti
      };
    });

    return result;
  } catch (error) {
    throw error;
  }
};

// Function to get detail panti by ID (keeping for backward compatibility)
const getDetailPantiById = async (detailPantiId) => {
  try {
    const detailPantiIdInt = parseInt(detailPantiId);
    
    if (isNaN(detailPantiIdInt)) {
      throw new Error('ID detail panti tidak valid');
    }
    
    const detailPanti = await prisma.detailPanti.findUnique({
      where: { id: detailPantiIdInt },
      include: {
        panti: {
          include: {
            yayasan: true,
            wilayah: true
          }
        }
      }
    });

    if (!detailPanti) {
      throw new Error('Detail panti tidak ditemukan');
    }

    return detailPanti;
  } catch (error) {
    throw error;
  }
};

// Function to update panti
const updatePanti = async (pantiId, data, fotoFile = null) => {
  try {
    const pantiIdInt = parseInt(pantiId);
    
    if (isNaN(pantiIdInt)) {
      throw new Error('ID panti tidak valid');
    }
    
    // Check if panti exists
    const panti = await prisma.panti.findUnique({
      where: { id: pantiIdInt },
      include: {
        detailPanti: true
      }
    });

    if (!panti) {
      throw new Error('Panti tidak ditemukan');
    }

    // Process yayasanId and wilayahId if provided
    let yayasanId = panti.yayasanId;
    if (data.yayasanId) {
      yayasanId = parseInt(data.yayasanId);
      // Check if yayasan exists
      const yayasan = await prisma.yayasan.findUnique({
        where: { id: yayasanId }
      });
      if (!yayasan) {
        throw new Error('Yayasan tidak ditemukan');
      }
    }

    let wilayahId = panti.wilayahId;
    if (data.wilayahId) {
      wilayahId = parseInt(data.wilayahId);
      // Check if wilayah exists
      const wilayah = await prisma.wilayah.findUnique({
        where: { id: wilayahId }
      });
      if (!wilayah) {
        throw new Error('Wilayah tidak ditemukan');
      }
    }

    // Process photo if provided
    let fotoUrl = panti.fotoUtama;
    if (fotoFile) {
      try {
        const fileContent = fotoFile.buffer.toString('base64');
        
        const uploadResponse = await imagekit.upload({
          file: fileContent,
          fileName: `panti-${Date.now()}`,
          folder: '/panti-photos'
        });
        
        fotoUrl = uploadResponse.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload panti image');
      }
    }

    // Update panti with transaction to update both panti and detail
    const result = await prisma.$transaction(async (prisma) => {
      // Update panti
      const updatedPanti = await prisma.panti.update({
        where: { id: pantiIdInt },
        data: {
          namaPanti: data.namaPanti || panti.namaPanti,
          fotoUtama: fotoUrl,
          deskripsiSingkat: data.deskripsiSingkat || panti.deskripsiSingkat,
          status: data.status || panti.status,
          yayasanId: yayasanId,
          wilayahId: wilayahId
        }
      });

      return updatedPanti;
    });

    // Get the updated panti with all relationships
    const updatedPanti = await prisma.panti.findUnique({
      where: { id: pantiIdInt },
      include: {
        yayasan: true,
        wilayah: true,
        detailPanti: true
      }
    });

    return updatedPanti;
  } catch (error) {
    throw error;
  }
};

// Function to update detail panti
const updateDetailPanti = async (pantiId, data) => {
  try {
    const pantiIdInt = parseInt(pantiId);
    
    if (isNaN(pantiIdInt)) {
      throw new Error('ID panti tidak valid');
    }
    
    // Check if panti exists
    const panti = await prisma.panti.findUnique({
      where: { id: pantiIdInt },
      include: {
        detailPanti: true
      }
    });

    if (!panti) {
      throw new Error('Panti tidak ditemukan');
    }

    // Check if detail panti exists
    if (!panti.detailPanti) {
      throw new Error('Detail panti tidak ditemukan, silakan buat terlebih dahulu');
    }

    // Process jumlahPenghuni
    let jumlahPenghuni = panti.detailPanti.jumlahPenghuni;
    if (data.jumlahPenghuni) {
      jumlahPenghuni = data.jumlahPenghuni;
      if (typeof jumlahPenghuni === 'string') {
        try {
          jumlahPenghuni = JSON.parse(jumlahPenghuni);
        } catch (e) {
          throw new Error('Format jumlah penghuni tidak valid');
        }
      }
    }

    // Process kategoriKebutuhan
    let kategoriKebutuhan = panti.detailPanti.kategoriKebutuhan;
    if (data.kategoriKebutuhan) {
      kategoriKebutuhan = data.kategoriKebutuhan;
      if (typeof kategoriKebutuhan === 'string') {
        try {
          kategoriKebutuhan = JSON.parse(kategoriKebutuhan);
        } catch (e) {
          // If it's a comma-separated string, convert to array
          kategoriKebutuhan = kategoriKebutuhan.split(',').map(item => item.trim());
        }
      }
    }

    // Process sumbanganDiterima
    let sumbanganDiterima = panti.detailPanti.sumbanganDiterima;
    if (data.sumbanganDiterima) {
      sumbanganDiterima = data.sumbanganDiterima;
      if (typeof sumbanganDiterima === 'string') {
        try {
          sumbanganDiterima = JSON.parse(sumbanganDiterima);
        } catch (e) {
          // If it's a comma-separated string, convert to array
          sumbanganDiterima = sumbanganDiterima.split(',').map(item => item.trim());
        }
      }
    }

    // Update detail panti
    const updatedDetailPanti = await prisma.detailPanti.update({
      where: { pantiId: pantiIdInt },
      data: {
        fokusPelayanan: data.fokusPelayanan || panti.detailPanti.fokusPelayanan,
        alamatLengkap: data.alamatLengkap || panti.detailPanti.alamatLengkap,
        deskripsiLengkap: data.deskripsiLengkap || panti.detailPanti.deskripsiLengkap,
        jumlahPengasuh: data.jumlahPengasuh ? parseInt(data.jumlahPengasuh) : panti.detailPanti.jumlahPengasuh,
        jumlahPenghuni: jumlahPenghuni,
        kategoriKebutuhan: kategoriKebutuhan,
        sumbanganDiterima: sumbanganDiterima
      }
    });

    // Update jumlahAnak in panti
    const totalAnak = 
      (typeof jumlahPenghuni.laki_laki === 'number' ? jumlahPenghuni.laki_laki : 0) + 
      (typeof jumlahPenghuni.perempuan === 'number' ? jumlahPenghuni.perempuan : 0);
    
    await prisma.panti.update({
      where: { id: pantiIdInt },
      data: { jumlahAnak: totalAnak }
    });

    return updatedDetailPanti;
  } catch (error) {
    throw error;
  }
};

// Function to delete panti
const deletePanti = async (pantiId) => {
  try {
    const pantiIdInt = parseInt(pantiId);
    
    if (isNaN(pantiIdInt)) {
      throw new Error('ID panti tidak valid');
    }
    
    // Check if panti exists
    const panti = await prisma.panti.findUnique({
      where: { id: pantiIdInt },
      include: {
        detailPanti: true
      }
    });

    if (!panti) {
      throw new Error('Panti tidak ditemukan');
    }

    // Delete with transaction to ensure both detail and panti are deleted
    const result = await prisma.$transaction(async (prisma) => {
      // Delete detail panti if exists
      if (panti.detailPanti) {
        await prisma.detailPanti.delete({
          where: { pantiId: pantiIdInt }
        });
      }

      // Delete panti
      const deletedPanti = await prisma.panti.delete({
        where: { id: pantiIdInt }
      });

      return deletedPanti;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

// Function to update panti status
const updatePantiStatus = async (pantiId, status) => {
  try {
    const pantiIdInt = parseInt(pantiId);
    
    if (isNaN(pantiIdInt)) {
      throw new Error('ID panti tidak valid');
    }
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new Error('Status tidak valid. Gunakan ACTIVE atau INACTIVE');
    }
    
    // Check if panti exists
    const panti = await prisma.panti.findUnique({
      where: { id: pantiIdInt }
    });

    if (!panti) {
      throw new Error('Panti tidak ditemukan');
    }

    // Update panti status
    const updatedPanti = await prisma.panti.update({
      where: { id: pantiIdInt },
      data: { status: status }
    });

    return updatedPanti;
  } catch (error) {
    throw error;
  }
};

// Function to get all pantis
const getAllPanti = async () => {
  try {
    const pantis = await prisma.panti.findMany({
      include: {
        yayasan: {
          select: {
            id: true,
            namaYayasan: true,
            kontakYayasan: true
          }
        },
        wilayah: {
          select: {
            id: true,
            nama: true,
            provinsi: true
          }
        },
        detailPanti: {
          select: {
            fokusPelayanan: true,
            jumlahPengasuh: true,
            jumlahPenghuni: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return pantis;
  } catch (error) {
    throw error;
  }
};

// Function to get active pantis
const getActivePanti = async () => {
  try {
    const pantis = await prisma.panti.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        yayasan: {
          select: {
            id: true,
            namaYayasan: true
          }
        },
        wilayah: {
          select: {
            id: true,
            nama: true,
            provinsi: true
          }
        }
      },
      orderBy: {
        namaPanti: 'asc'
      }
    });

    return pantis;
  } catch (error) {
    throw error;
  }
};

// Function to get a panti by ID
const getPantiById = async (pantiId) => {
  try {
    const pantiIdInt = parseInt(pantiId);
    
    if (isNaN(pantiIdInt)) {
      throw new Error('ID panti tidak valid');
    }
    
    const panti = await prisma.panti.findUnique({
      where: { id: pantiIdInt },
      include: {
        yayasan: {
          select: {
            id: true,
            namaYayasan: true,
            alamatYayasan: true,
            emailYayasan: true,
            kontakYayasan: true
          }
        },
        wilayah: {
          select: {
            id: true,
            nama: true,
            provinsi: true
          }
        },
        detailPanti: true
      }
    });

    if (!panti) {
      throw new Error('Panti tidak ditemukan');
    }

    // Format response to match the required structure
    const formattedResponse = {
      id_panti: panti.id,
      nama_panti: panti.namaPanti,
      foto_utama: panti.fotoUtama,
      deskripsi_singkat: panti.deskripsiSingkat,
      jumlah_anak: panti.jumlahAnak,
      status: panti.status.toLowerCase(),
      yayasan: {
        id_yayasan: panti.yayasan.id,
        nama_yayasan: panti.yayasan.namaYayasan,
        kontak_yayasan: panti.yayasan.kontakYayasan
      },
      wilayah: {
        id_wilayah: panti.wilayah.id,
        nama_wilayah: panti.wilayah.nama,
        provinsi: panti.wilayah.provinsi
      }
    };

    // Add detail if it exists
    if (panti.detailPanti) {
      formattedResponse.detail = {
        fokus_pelayanan: panti.detailPanti.fokusPelayanan,
        alamat_lengkap: panti.detailPanti.alamatLengkap,
        deskripsi_lengkap: panti.detailPanti.deskripsiLengkap,
        jumlah_pengasuh: panti.detailPanti.jumlahPengasuh,
        jumlah_penghuni: panti.detailPanti.jumlahPenghuni,
        kategori_kebutuhan: panti.detailPanti.kategoriKebutuhan,
        sumbangan_diterima: panti.detailPanti.sumbanganDiterima
      };
    }

    return formattedResponse;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createPanti,
  getAllPanti,
  getActivePanti,
  getPantiById,
  getDetailPantiById,
  updatePanti,
  updateDetailPanti,
  deletePanti,
  updatePantiStatus
};