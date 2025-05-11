const pantiService = require('../services/pantiService');

// Controller to create a new panti with detail
const createPanti = async (req, res) => {
  try {
    const pantiData = req.body;
    const fotoFile = req.file;
    const userId = req.user.id;

    if (!pantiData.namaPanti || !pantiData.deskripsiSingkat || !pantiData.yayasanId || !pantiData.wilayahId) {
      return res.status(400).json({ 
        message: 'Nama panti, deskripsi singkat, ID yayasan, dan ID wilayah wajib diisi' 
      });
    }

    const panti = await pantiService.createPanti(pantiData, userId, fotoFile);

    res.status(201).json({
      message: 'Panti dan detail berhasil dibuat',
      data: panti
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller to get all pantis
const getAllPanti = async (req, res) => {
  try {
    const pantis = await pantiService.getAllPanti();

    res.status(200).json({
      message: 'Daftar panti berhasil diambil',
      data: pantis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get active pantis
const getActivePanti = async (req, res) => {
  try {
    const pantis = await pantiService.getActivePanti();

    res.status(200).json({
      message: 'Daftar panti aktif berhasil diambil',
      data: pantis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a panti by ID
const getPantiById = async (req, res) => {
  try {
    const { pantiId } = req.params;
    const panti = await pantiService.getPantiById(pantiId);

    res.status(200).json({
      status: "success",
      data: {
        panti: panti
      }
    });
  } catch (error) {
    res.status(404).json({ 
      status: "error",
      message: error.message 
    });
  }
};

// Controller to get detail panti by ID (kept for backward compatibility)
const getDetailPantiById = async (req, res) => {
  try {
    const { detailPantiId } = req.params;
    const detailPanti = await pantiService.getDetailPantiById(detailPantiId);

    res.status(200).json({
      message: 'Detail panti berhasil diambil',
      data: detailPanti
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Controller to update panti
const updatePanti = async (req, res) => {
  try {
    const { pantiId } = req.params;
    const pantiData = req.body;
    const fotoFile = req.file;

    // Check if at least one field is provided for update
    if (!pantiData.namaPanti && !pantiData.deskripsiSingkat && 
        !pantiData.yayasanId && !pantiData.wilayahId && 
        !pantiData.status && !fotoFile) {
      return res.status(400).json({ 
        message: 'Setidaknya satu field harus diisi untuk pembaruan' 
      });
    }

    // Validate status if provided
    if (pantiData.status && !['ACTIVE', 'INACTIVE'].includes(pantiData.status)) {
      return res.status(400).json({ 
        message: 'Status tidak valid. Gunakan ACTIVE atau INACTIVE' 
      });
    }

    const updatedPanti = await pantiService.updatePanti(pantiId, pantiData, fotoFile);

    res.status(200).json({
      message: 'Panti berhasil diperbarui',
      data: updatedPanti
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller to update detail panti
const updateDetailPanti = async (req, res) => {
  try {
    const { pantiId } = req.params;
    const detailData = req.body;

    // Check if at least one field is provided for update
    if (!detailData.fokusPelayanan && !detailData.alamatLengkap && 
        !detailData.deskripsiLengkap && !detailData.jumlahPengasuh && 
        !detailData.jumlahPenghuni && !detailData.kategoriKebutuhan && 
        !detailData.sumbanganDiterima) {
      return res.status(400).json({ 
        message: 'Setidaknya satu field harus diisi untuk pembaruan' 
      });
    }

    const updatedDetailPanti = await pantiService.updateDetailPanti(pantiId, detailData);

    res.status(200).json({
      message: 'Detail panti berhasil diperbarui',
      data: updatedDetailPanti
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller to delete panti
const deletePanti = async (req, res) => {
  try {
    const { pantiId } = req.params;
    const deletedPanti = await pantiService.deletePanti(pantiId);

    res.status(200).json({
      message: 'Panti berhasil dihapus',
      data: deletedPanti
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller to update panti status
const updatePantiStatus = async (req, res) => {
  try {
    const { pantiId } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status tidak valid. Gunakan ACTIVE atau INACTIVE' 
      });
    }

    const updatedPanti = await pantiService.updatePantiStatus(pantiId, status);

    res.status(200).json({
      message: `Panti berhasil ${status === 'ACTIVE' ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: updatedPanti
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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