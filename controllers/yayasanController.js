const yayasanService = require('../services/yayasanService');

// Controller for creating a new yayasan
const createYayasan = async (req, res) => {
  try {
    const { namaYayasan, alamatYayasan, emailYayasan, kontakYayasan } = req.body;
    
    if (!namaYayasan || !alamatYayasan) {
      return res.status(400).json({ 
        message: 'Nama yayasan dan alamat yayasan wajib diisi' 
      });
    }
    
    // Validate kontakYayasan format if provided
    if (kontakYayasan) {
      try {
        // If it's a string, try to parse it
        const kontakData = typeof kontakYayasan === 'string' 
          ? JSON.parse(kontakYayasan) 
          : kontakYayasan;
          
        // Check if it's an array of objects with required properties
        if (!Array.isArray(kontakData)) {
          return res.status(400).json({ 
            message: 'Format kontak yayasan tidak valid. Gunakan format array objek' 
          });
        }
        
        for (const kontak of kontakData) {
          if (!kontak.nama_kontak || !kontak.nomor_telepon) {
            return res.status(400).json({ 
              message: 'Setiap kontak harus memiliki nama_kontak dan nomor_telepon' 
            });
          }
        }
        
        // Use the parsed data
        req.body.kontakYayasan = kontakData;
      } catch (e) {
        return res.status(400).json({ 
          message: 'Format kontak yayasan tidak valid' 
        });
      }
    }
    
    const yayasan = await yayasanService.createYayasan(req.body);
    
    res.status(201).json({
      message: 'Yayasan berhasil dibuat',
      data: yayasan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller for getting all yayasan
const getAllYayasan = async (req, res) => {
  try {
    const yayasans = await yayasanService.getAllYayasan();
    
    res.status(200).json({
      message: 'Data yayasan berhasil diambil',
      data: yayasans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for getting active yayasan
const getActiveYayasan = async (req, res) => {
  try {
    const yayasans = await yayasanService.getActiveYayasan();
    
    res.status(200).json({
      message: 'Data yayasan aktif berhasil diambil',
      data: yayasans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for getting a yayasan by ID
const getYayasanById = async (req, res) => {
  try {
    const { yayasanId } = req.params;
    const yayasan = await yayasanService.getYayasanById(yayasanId);
    
    res.status(200).json({
      message: 'Data yayasan berhasil diambil',
      data: yayasan
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Controller for updating a yayasan
const updateYayasan = async (req, res) => {
  try {
    const { yayasanId } = req.params;
    const { namaYayasan, alamatYayasan, emailYayasan, kontakYayasan, status } = req.body;
    
    // Check if at least one field is provided for update
    if (!namaYayasan && !alamatYayasan && emailYayasan === undefined && kontakYayasan === undefined && !status) {
      return res.status(400).json({ 
        message: 'Setidaknya satu field harus diisi untuk pembaruan' 
      });
    }
    
    // Validate status if provided
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status tidak valid. Gunakan ACTIVE atau INACTIVE' 
      });
    }
    
    // Validate kontakYayasan format if provided
    if (kontakYayasan !== undefined) {
      try {
        // If it's a string, try to parse it
        const kontakData = typeof kontakYayasan === 'string' 
          ? JSON.parse(kontakYayasan) 
          : kontakYayasan;
          
        // If null, that's fine, just pass it through
        if (kontakData !== null) {
          // Check if it's an array of objects with required properties
          if (!Array.isArray(kontakData)) {
            return res.status(400).json({ 
              message: 'Format kontak yayasan tidak valid. Gunakan format array objek' 
            });
          }
          
          for (const kontak of kontakData) {
            if (!kontak.nama_kontak || !kontak.nomor_telepon) {
              return res.status(400).json({ 
                message: 'Setiap kontak harus memiliki nama_kontak dan nomor_telepon' 
              });
            }
          }
        }
        
        // Use the parsed data
        req.body.kontakYayasan = kontakData;
      } catch (e) {
        return res.status(400).json({ 
          message: 'Format kontak yayasan tidak valid' 
        });
      }
    }
    
    const updatedYayasan = await yayasanService.updateYayasan(yayasanId, req.body);
    
    res.status(200).json({
      message: 'Yayasan berhasil diperbarui',
      data: updatedYayasan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller for deleting a yayasan
const deleteYayasan = async (req, res) => {
  try {
    const { yayasanId } = req.params;
    const deletedYayasan = await yayasanService.deleteYayasan(yayasanId);
    
    res.status(200).json({
      message: 'Yayasan berhasil dihapus',
      data: deletedYayasan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller for updating yayasan status
const updateYayasanStatus = async (req, res) => {
  try {
    const { yayasanId } = req.params;
    const { status } = req.body;
    
    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status tidak valid. Gunakan ACTIVE atau INACTIVE' 
      });
    }
    
    const updatedYayasan = await yayasanService.updateYayasanStatus(yayasanId, status);
    
    res.status(200).json({
      message: `Yayasan berhasil ${status === 'ACTIVE' ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: updatedYayasan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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