const bcrypt = require('bcryptjs');
const prisma = require('../configs/prisma');
const { generateToken } = require('../configs/jwt');
const imagekit = require('../configs/imagekit');

const register = async (email, password, role = 'ADMIN', userData = {}) => {
  try {
    // Debugging log
    console.log("Registering user with data:", { email, role });
    console.log("User profile data:", userData);

    // Check if email already exists in users or volunteers
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    const existingVolunteer = await prisma.volunteer.findUnique({
      where: { email }
    });

    if (existingUser || existingVolunteer) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with basic authentication fields
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        status: 'ACTIVE'
      }
    });

    console.log("User created:", user.id);

    // Create volunteer entry with profile data
    if (userData.namaLengkap && userData.jenisKelamin) {
      console.log("Creating volunteer record for user");
      try {
        // Make sure wilayahId is an integer
        let wilayahId = userData.wilayahId;
        if (wilayahId && typeof wilayahId === 'string') {
          wilayahId = parseInt(wilayahId);
          if (isNaN(wilayahId)) {
            throw new Error('wilayahId must be a valid number');
          }
        }

        const volunteer = await prisma.volunteer.create({
          data: {
            namaLengkap: userData.namaLengkap,
            jenisKelamin: userData.jenisKelamin,
            tempatLahir: userData.tempatLahir || '',
            tanggalLahir: userData.tanggalLahir || new Date(),
            alamatDomisili: userData.alamatDomisili || '',
            kewarganegaraan: userData.kewarganegaraan || 'Indonesia',
            nomorHP: userData.nomorHP || '',
            email: email,
            wilayahId: wilayahId,
            status: 'ACTIVE'
          }
        });
        console.log("Volunteer record created:", volunteer.id);
      } catch (volunteerError) {
        console.error("Error creating volunteer record:", volunteerError);
        
        // If volunteer creation fails, delete the user to maintain data consistency
        await prisma.user.delete({
          where: { id: user.id }
        });
        
        throw volunteerError;
      }
    } else {
      console.log("Skipping volunteer creation - missing required fields");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status === 'INACTIVE') {
      throw new Error('Account is inactive');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }



    // Generate JWT token
    const token = generateToken({ 
      userId: user.id,
      role: user.role 
    });

    // Create response object with only necessary information
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };
      
    
    return {
      user: userResponse,
      token
    };
  } catch (error) {
    throw error;
  }
};

const createAdmin = async (userData, creatorId) => {
  try {
    // Check if creator is a SUPERADMIN
    const creator = await prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (!creator || creator.role !== 'SUPERADMIN') {
      throw new Error('Only SUPERADMIN can create new admins');
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    const existingVolunteer = await prisma.volunteer.findUnique({
      where: { email: userData.email }
    });

    if (existingUser || existingVolunteer) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Upload profile image if provided
    let profileImageUrl = null;
    if (userData.profileImage) {
      try {
        const fileContent = userData.profileImage.buffer.toString('base64');
        
        const uploadResponse = await imagekit.upload({
          file: fileContent,
          fileName: `profile-${Date.now()}`,
          folder: '/user-profiles'
        });
        
        profileImageUrl = uploadResponse.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload profile image');
      }
    }

    // Create user with only basic auth fields
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    // Create volunteer entry for the admin with all profile data
    const volunteer = await prisma.volunteer.create({
      data: {
        namaLengkap: userData.namaLengkap,
        jenisKelamin: userData.jenisKelamin,
        tempatLahir: userData.tempatLahir,
        tanggalLahir: new Date(userData.tanggalLahir),
        alamatDomisili: userData.alamatDomisili,
        kewarganegaraan: userData.kewarganegaraan,
        nomorHP: userData.nomorHP,
        email: userData.email,
        wilayahId: userData.wilayahId,
        status: 'ACTIVE'
      },
      include: {
        wilayah: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Combine user and volunteer data for response
    return {
      ...userWithoutPassword,
      volunteerInfo: volunteer
    };
  } catch (error) {
    throw error;
  }
};

const getAllAdmins = async () => {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    });
    
    // Get corresponding volunteer data for each admin
    const adminsWithVolunteerInfo = await Promise.all(
      admins.map(async (admin) => {
        // Remove password from admin data
        const { password, ...adminWithoutPassword } = admin;
        
        // Get volunteer data for this admin
        const volunteer = await prisma.volunteer.findUnique({
          where: { email: admin.email },
          include: {
            wilayah: {
              select: {
                id: true,
                nama: true
              }
            }
          }
        });
        
        // Return admin with volunteer info
        return {
          ...adminWithoutPassword,
          volunteerInfo: volunteer || null
        };
      })
    );
    
    return adminsWithVolunteerInfo;
  } catch (error) {
    throw error;
  }
};

const deleteAdmin = async (adminId, superAdminId) => {
  try {
    // Check if requester is SUPERADMIN
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId }
    });

    if (!superAdmin || superAdmin.role !== 'SUPERADMIN') {
      throw new Error('Hanya SUPERADMIN yang dapat menghapus admin');
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin tidak ditemukan');
    }

    if (admin.role === 'SUPERADMIN') {
      throw new Error('Tidak dapat menghapus SUPERADMIN');
    }

    // Update admin status to INACTIVE instead of deleting
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: { status: 'INACTIVE' }
    });

    // Also update corresponding volunteer status
    const volunteer = await prisma.volunteer.findUnique({
      where: { email: admin.email }
    });

    if (volunteer) {
      await prisma.volunteer.update({
        where: { id: volunteer.id },
        data: { status: 'INACTIVE' }
      });
    }

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = updatedAdmin;
    return adminWithoutPassword;
  } catch (error) {
    throw error;
  }
};

const resetAdminPassword = async (adminId, superAdminId) => {
  try {
    // Check if requester is SUPERADMIN
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId }
    });

    if (!superAdmin || superAdmin.role !== 'SUPERADMIN') {
      throw new Error('Hanya SUPERADMIN yang dapat mereset password admin');
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin tidak ditemukan');
    }

    // Hash default password
    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Update admin password
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = updatedAdmin;
    return adminWithoutPassword;
  } catch (error) {
    throw error;
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Password saat ini tidak valid');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

const reactivateAdmin = async (adminId, superAdminId) => {
  try {
    // Check if requester is SUPERADMIN
    const superAdmin = await prisma.user.findUnique({
      where: { id: superAdminId }
    });

    if (!superAdmin || superAdmin.role !== 'SUPERADMIN') {
      throw new Error('Hanya SUPERADMIN yang dapat mengaktifkan kembali admin');
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new Error('Admin tidak ditemukan');
    }

    if (admin.status === 'ACTIVE') {
      throw new Error('Admin sudah aktif');
    }

    // Update admin status to ACTIVE
    const updatedAdmin = await prisma.user.update({
      where: { id: adminId },
      data: { status: 'ACTIVE' }
    });

    // Also update corresponding volunteer status
    const volunteer = await prisma.volunteer.findUnique({
      where: { email: admin.email }
    });

    if (volunteer) {
      await prisma.volunteer.update({
        where: { id: volunteer.id },
        data: { status: 'ACTIVE' }
      });
    }

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = updatedAdmin;
    return adminWithoutPassword;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  resetAdminPassword,
  changePassword,
  reactivateAdmin
};