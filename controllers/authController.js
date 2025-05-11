const authService = require("../services/authService");
const prisma = require('../configs/prisma'); 


const registerSuperAdmin = async (req, res) => {
  try {
    const { email, password, namaLengkap, jenisKelamin } = req.body;

    // Log received values for debugging
    console.log("Request body:", req.body);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("namaLengkap:", namaLengkap);
    console.log("jenisKelamin:", jenisKelamin);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate required fields for volunteer
    if (!namaLengkap || !jenisKelamin) {
      return res.status(400).json({ message: 'Nama lengkap dan jenis kelamin wajib diisi' });
    }

    // Ensure wilayahId is an integer if provided
    let wilayahId = req.body.wilayahId;
    if (wilayahId && typeof wilayahId === 'string') {
      wilayahId = parseInt(wilayahId);
      if (isNaN(wilayahId)) {
        return res.status(400).json({ message: 'wilayahId harus berupa angka' });
      }
    }

    // Create userData object with all available profile fields
    const userData = {
      namaLengkap,
      jenisKelamin,
      tempatLahir: req.body.tempatLahir || '',
      tanggalLahir: req.body.tanggalLahir ? new Date(req.body.tanggalLahir) : new Date(),
      alamatDomisili: req.body.alamatDomisili || '',
      kewarganegaraan: req.body.kewarganegaraan || 'Indonesia',
      nomorHP: req.body.nomorHP || '',
      wilayahId: wilayahId,
    };

    const user = await authService.register(email, password, 'SUPERADMIN', userData);
    res.status(201).json({
      message: 'SUPERADMIN registered successfully',
      user
    });
  } catch (error) {
    console.error("Register SUPERADMIN error:", error);
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await authService.login(email, password);
    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const userData = req.body;
    const profileImage = req.file;
    const creatorId = req.user.id;

    if (!userData.email || !userData.password || !userData.namaLengkap) {
      return res
        .status(400)
        .json({ message: "Email, password, dan nama lengkap wajib diisi" });
    }

    // Add profile image to userData if provided
    if (profileImage) {
      userData.profileImage = profileImage;
    }

    const admin = await authService.createAdmin(userData, creatorId);

    res.status(201).json({
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    // User is already attached to req from authenticate middleware
    const { password, ...userWithoutPassword } = req.user;

    // Get the volunteer data associated with this user
    const volunteer = await prisma.volunteer.findUnique({
      where: { email: req.user.email },
      include: {
        wilayah: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Profile fetched successfully",
      user: userWithoutPassword,
      volunteer: volunteer,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await authService.getAllAdmins();
    res.status(200).json({
      message: "Admins fetched successfully",
      data: admins,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const superAdminId = req.user.id;

    const inactivatedAdmin = await authService.deleteAdmin(
      adminId,
      superAdminId
    );

    res.status(200).json({
      message: "Admin berhasil dinonaktifkan",
      data: inactivatedAdmin,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const superAdminId = req.user.id;

    const updatedAdmin = await authService.resetAdminPassword(
      adminId,
      superAdminId
    );

    res.status(200).json({
      message: "Password admin berhasil direset ke default",
      data: updatedAdmin,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Password saat ini dan password baru wajib diisi" });
    }

    // Validasi password baru
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password baru minimal 6 karakter" });
    }

    const updatedUser = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      message: "Password berhasil diubah",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const reactivateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const superAdminId = req.user.id;

    const reactivatedAdmin = await authService.reactivateAdmin(
      adminId,
      superAdminId
    );

    res.status(200).json({
      message: "Admin berhasil diaktifkan kembali",
      data: reactivatedAdmin,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerSuperAdmin,
  login,
  createAdmin,
  getProfile,
  getAllAdmins,
  deleteAdmin,
  resetAdminPassword,
  changePassword,
  reactivateAdmin,
};
