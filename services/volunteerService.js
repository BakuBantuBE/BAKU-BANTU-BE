const prisma = require('../configs/prisma');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const imagekit = require('../configs/imagekit'); // Add this import for ImageKit


// Fungsi untuk mendaftarkan relawan baru
const registerVolunteer = async (volunteerData, profileImage = null) => {
  try {
    // Check if email already exists in volunteers or users
    const existingVolunteer = await prisma.volunteer.findUnique({
      where: { email: volunteerData.email }
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: volunteerData.email }
    });

    if (existingVolunteer || existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    // Ensure wilayahId is an integer
    let wilayahId = volunteerData.wilayahId;
    if (typeof wilayahId === 'string') {
      wilayahId = parseInt(wilayahId);
      if (isNaN(wilayahId)) {
        throw new Error('wilayahId harus berupa angka');
      }
    }

    // Upload profile image if provided
    let profileImageUrl = null;
    if (profileImage) {
      try {
        const fileContent = profileImage.buffer.toString('base64');
        
        const uploadResponse = await imagekit.upload({
          file: fileContent,
          fileName: `volunteer-${Date.now()}`,
          folder: '/volunteer-profiles'
        });
        
        profileImageUrl = uploadResponse.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload profile image');
      }
    }

    // Create new volunteer with PENDING status
    const volunteer = await prisma.volunteer.create({
      data: {
        namaLengkap: volunteerData.namaLengkap,
        jenisKelamin: volunteerData.jenisKelamin,
        tempatLahir: volunteerData.tempatLahir,
        tanggalLahir: new Date(volunteerData.tanggalLahir),
        alamatDomisili: volunteerData.alamatDomisili,
        kewarganegaraan: volunteerData.kewarganegaraan,
        nomorHP: volunteerData.nomorHP,
        email: volunteerData.email,
        wilayahId: wilayahId,
        profileImage: profileImageUrl, 
        jabatan: "Relawan",
        status: 'PENDING'
      }
    });

    return volunteer;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan semua relawan
const getAllVolunteers = async () => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      include: {
        wilayah: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return volunteers;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan relawan dengan status ACTIVE saja
const getActiveVolunteers = async () => {
  try {
    const activeVolunteers = await prisma.volunteer.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        wilayah: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: {
        namaLengkap: 'asc'
      }
    });

    return activeVolunteers;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan detail relawan berdasarkan ID
const getVolunteerById = async (volunteerId) => {
  try {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        wilayah: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    });

    if (!volunteer) {
      throw new Error('Relawan tidak ditemukan');
    }

    return volunteer;
  } catch (error) {
    throw error;
  }
};

const updateVolunteer = async (volunteerId, volunteerData, profileImage = null) => {
  try {
    // Check if volunteer exists
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        wilayah: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    });

    if (!volunteer) {
      throw new Error('Relawan tidak ditemukan');
    }
    
    // Get the current status before updating
    const previousStatus = volunteer.status;
    
    // Upload profile image if provided
    let profileImageUrl = volunteer.profileImage;
    if (profileImage) {
      try {
        const fileContent = profileImage.buffer.toString('base64');
        
        const uploadResponse = await imagekit.upload({
          file: fileContent,
          fileName: `volunteer-${Date.now()}`,
          folder: '/volunteer-profiles'
        });
        
        profileImageUrl = uploadResponse.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload profile image');
      }
    }
    
    // Format date if provided
    let tanggalLahir = volunteer.tanggalLahir;
    if (volunteerData.tanggalLahir) {
      tanggalLahir = new Date(volunteerData.tanggalLahir);
    }

    // Ensure wilayahId is an integer if provided
    let wilayahId = volunteer.wilayahId;
    if (volunteerData.wilayahId) {
      wilayahId = typeof volunteerData.wilayahId === 'string' ? 
        parseInt(volunteerData.wilayahId) : volunteerData.wilayahId;
      
      if (isNaN(wilayahId)) {
        throw new Error('wilayahId harus berupa angka');
      }
    }
    
    // Update volunteer data
    const updatedVolunteer = await prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        namaLengkap: volunteerData.namaLengkap || volunteer.namaLengkap,
        jenisKelamin: volunteerData.jenisKelamin || volunteer.jenisKelamin,
        tempatLahir: volunteerData.tempatLahir || volunteer.tempatLahir,
        tanggalLahir: tanggalLahir,
        alamatDomisili: volunteerData.alamatDomisili || volunteer.alamatDomisili,
        kewarganegaraan: volunteerData.kewarganegaraan || volunteer.kewarganegaraan,
        nomorHP: volunteerData.nomorHP || volunteer.nomorHP,
        email: volunteerData.email || volunteer.email,
        wilayahId: wilayahId,
        profileImage: profileImageUrl,
        jabatan: volunteerData.jabatan || volunteer.jabatan,
        status: volunteerData.status || volunteer.status
      },
      include: {
        wilayah: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    });
    
    // Check if there's a corresponding user account and update its status accordingly
    if (volunteerData.status && volunteerData.status !== previousStatus) {
      const existingUser = await prisma.user.findUnique({
        where: { email: volunteer.email }
      });
      
      if (existingUser) {
        // If setting volunteer to INACTIVE, also set user to INACTIVE
        if (volunteerData.status === 'INACTIVE') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { status: 'INACTIVE' }
          });
          console.log(`User account for ${volunteer.email} set to INACTIVE`);
        } 
        // If setting volunteer to ACTIVE and user is currently INACTIVE, reactivate user
        else if (volunteerData.status === 'ACTIVE' && existingUser.status === 'INACTIVE') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { status: 'ACTIVE' }
          });
          console.log(`User account for ${volunteer.email} set to ACTIVE`);
        }
      }
      
      // Send email based on status change
      try {
        // If status changed from PENDING to ACTIVE, send activation email
        if (previousStatus === 'PENDING' && volunteerData.status === 'ACTIVE') {
          await emailService.sendActivationEmail(updatedVolunteer);
          console.log(`Activation email sent to ${updatedVolunteer.email}`);
        }
        
        // If status changed to INACTIVE, send deactivation email
        if (volunteerData.status === 'INACTIVE' && previousStatus !== 'INACTIVE') {
          await emailService.sendDeactivationEmail(updatedVolunteer);
          console.log(`Deactivation email sent to ${updatedVolunteer.email}`);
        }
      } catch (emailError) {
        // Log email error but don't fail the function
        console.error('Error sending status change email:', emailError);
        // We continue with the function since the volunteer status has been updated
      }
    }

    return updatedVolunteer;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk membuat admin dari volunteer
const createAdminFromVolunteer = async (volunteerId, superAdminId) => {
  try {
    // Cek apakah requester adalah SUPERADMIN
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId }
    });

    if (!superAdmin || superAdmin.role !== 'SUPERADMIN') {
      throw new Error('Hanya SUPERADMIN yang dapat membuat admin dari relawan');
    }

    // Cek apakah volunteer ada dan statusnya ACTIVE
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        wilayah: true
      }
    });

    if (!volunteer) {
      throw new Error('Relawan tidak ditemukan');
    }

    if (volunteer.status !== 'ACTIVE') {
      throw new Error('Hanya relawan dengan status ACTIVE yang dapat dijadikan admin');
    }

    // Cek apakah sudah ada user dengan email tersebut
    const existingUser = await prisma.user.findUnique({
      where: { email: volunteer.email }
    });

    if (existingUser) {
      throw new Error('Relawan ini sudah terdaftar sebagai user');
    }

    // Create new admin user with default password
    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    const newAdmin = await prisma.user.create({
      data: {
        email: volunteer.email,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    // Send admin creation email
    try {
      await emailService.sendAdminCreationEmail(volunteer, defaultPassword);
      console.log(`Admin creation email sent to ${volunteer.email}`);
    } catch (emailError) {
      // Log email error but don't fail the function
      console.error('Error sending admin creation email:', emailError);
      // We continue with the function since the admin has been created
    }

    // Return volunteer info with new admin
    return {
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status
      },
      volunteer: volunteer
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerVolunteer,
  getAllVolunteers,
  getActiveVolunteers,
  getVolunteerById,
  updateVolunteer,
  createAdminFromVolunteer
};