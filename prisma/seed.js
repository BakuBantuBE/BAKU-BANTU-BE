const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  try {
    // Create default wilayahs if none exist
    console.log('Checking and creating wilayahs...');
    let wilayahs = await prisma.wilayah.findMany();
    
    if (wilayahs.length === 0) {
      const wilayahData = [
        { nama: 'Manado', provinsi: 'Sulawesi Utara' },
        { nama: 'Minahasa', provinsi: 'Sulawesi Utara' },
        { nama: 'Minahasa Selatan', provinsi: 'Sulawesi Utara' },
        { nama: 'Tomohon', provinsi: 'Sulawesi Utara' },
        { nama: 'Bitung', provinsi: 'Sulawesi Utara' },
        { nama: 'Minahasa Utara', provinsi: 'Sulawesi Utara' },
        { nama: 'Minahasa Tenggara', provinsi: 'Sulawesi Utara' },
        { nama: 'Bolaang Mongondow', provinsi: 'Sulawesi Utara' },
        { nama: 'Bolaang Mongondow Utara', provinsi: 'Sulawesi Utara' },
        { nama: 'Bolaang Mongondow Selatan', provinsi: 'Sulawesi Utara' },
        { nama: 'Bolaang Mongondow Timur', provinsi: 'Sulawesi Utara' },
      ];
      
      for (const wilayah of wilayahData) {
        await prisma.wilayah.create({
          data: {
            nama: wilayah.nama,
            provinsi: wilayah.provinsi,
            status: 'ACTIVE'
          }
        });
        console.log(`Created wilayah: ${wilayah.nama}`);
      }
      
      // Fetch the newly created wilayahs
      wilayahs = await prisma.wilayah.findMany();
    }
    console.log(`Found ${wilayahs.length} wilayahs`);
    
    // Find Manado wilayah for all volunteers
    const manadoWilayah = wilayahs.find(w => w.nama === 'Manado');
    const tomohonWilayah = wilayahs.find(w => w.nama === 'Tomohon');
    const minahasaWilayah = wilayahs.find(w => w.nama === 'Minahasa');
    const minahasaSelatanWilayah = wilayahs.find(w => w.nama === 'Minahasa Selatan');
    
    if (!manadoWilayah) {
      throw new Error('Manado wilayah not found');
    }

    // Random date generator for birthdays between 1985 and 2000
    const getRandomBirthDate = () => {
      const start = new Date('1985-01-01');
      const end = new Date('2000-12-31');
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Random phone number generator
    const getRandomPhone = () => {
      return `08${Math.floor(10000000 + Math.random() * 90000000)}`;
    };

    // Create or update SUPERADMIN
    console.log('Creating SUPERADMIN...');
    const hashedPassword = await bcrypt.hash('bakubantusulut123', 10);
    
    // Superadmin email
    const superadminEmail = 'krisan.vs@gmail.com';
    
    // Check if superadmin user already exists
    let superadmin = await prisma.user.findFirst({
      where: { 
        email: superadminEmail,
        role: 'SUPERADMIN'
      }
    });
    
    // Create or update superadmin user
    if (!superadmin) {
      console.log('Creating SUPERADMIN user...');
      superadmin = await prisma.user.create({
        data: {
          email: superadminEmail,
          password: hashedPassword,
          role: 'SUPERADMIN',
          status: 'ACTIVE'
        },
      });
      console.log('SUPERADMIN user created:', superadmin.id);
    } else {
      console.log('SUPERADMIN user already exists:', superadmin.id);
    }
    
    // Check if volunteer record exists for this superadmin
    const existingSuperadminVolunteer = await prisma.volunteer.findUnique({
      where: { email: superadminEmail }
    });
    
    // Create or update volunteer record for superadmin
    if (!existingSuperadminVolunteer) {
      await prisma.volunteer.create({
        data: {
          namaLengkap: 'Krisan Valerie Sangari',
          jenisKelamin: 'FEMALE',
          tempatLahir: 'Manado',
          tanggalLahir: new Date('1990-01-01'),
          alamatDomisili: 'Manado',
          kewarganegaraan: 'Indonesia',
          nomorHP: '08123456789',
          email: superadminEmail,
          jabatan: 'Koordinator/Inisiator',
          wilayahId: tomohonWilayah ? tomohonWilayah.id : manadoWilayah.id,
          profileImage: 'https://ik.imagekit.io/bakubantu/volunteer-profiles/krisan-valerie-sangari.jpg',
          status: 'ACTIVE'
        }
      });
      console.log('SUPERADMIN volunteer record created');
    } else {
      console.log('SUPERADMIN volunteer record already exists');
    }

    // Array of volunteer data from screenshots
    const volunteersData = [
      {
        namaLengkap: 'Hizkia Ticonuwu',
        jenisKelamin: 'MALE',
        jabatan: 'Compliance and Procurement Officer',
        email: 'ganeshaticonu@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Dea Tampi',
        jenisKelamin: 'FEMALE',
        jabatan: 'Program Support & Communication Officer',
        email: 'deatampi321@gmail.com',
        wilayahId: tomohonWilayah ? tomohonWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Kristi Sangari',
        jenisKelamin: 'FEMALE',
        jabatan: 'Administration Officer',
        email: 'kiasangari@gmail.com',
        wilayahId: tomohonWilayah ? tomohonWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Hosiana Kilis',
        jenisKelamin: 'FEMALE',
        jabatan: 'Psychosocial Program Officer',
        email: 'hosianarik@gmail.com',
        wilayahId: tomohonWilayah ? tomohonWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Revandy Wuntu',
        jenisKelamin: 'MALE',
        jabatan: 'Government Relations Officer',
        email: 'revandyeliazar@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Christian Pepah',
        jenisKelamin: 'MALE',
        jabatan: 'Finance Officer',
        email: 'pepahchristian@gmail.com',
        wilayahId: manadoWilayah.id
      },
      // Enumerators from image 2
      {
        namaLengkap: 'Wulan Wenas',
        jenisKelamin: 'FEMALE',
        jabatan: 'Enumerator',
        email: 'wulanwenas@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Hizkia Posumah',
        jenisKelamin: 'MALE',
        jabatan: 'Enumerator',
        email: 'hizposumah@gmail.com',
        wilayahId: minahasaSelatanWilayah ? minahasaSelatanWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Desty Tumuju',
        jenisKelamin: 'FEMALE',
        jabatan: 'Enumerator',
        email: 'destytumuju08@gmail.com',
        wilayahId: minahasaSelatanWilayah ? minahasaSelatanWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Yosua Mamudi',
        jenisKelamin: 'MALE',
        jabatan: 'Enumerator',
        email: 'yosmamudi@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Hana Mamudi',
        jenisKelamin: 'FEMALE',
        jabatan: 'Enumerator',
        email: 'hanamamudi00@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Nathania Trixie Lomboan',
        jenisKelamin: 'FEMALE',
        jabatan: 'Enumerator',
        email: 'nathalomboan@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Rahel Sverin Mokalu',
        jenisKelamin: 'FEMALE',
        jabatan: 'Enumerator',
        email: 'rahelmokalu04@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Mark Puyun Wowor Roring',
        jenisKelamin: 'MALE',
        jabatan: 'Enumerator',
        email: 'roringmark12@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Cliff Matthew Sumangkut',
        jenisKelamin: 'MALE',
        jabatan: 'Enumerator',
        email: 'cliffmatthew42@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Luisa Lantang',
        jenisKelamin: 'FEMALE',
        jabatan: 'Enumerator',
        email: 'lantangluisa@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Wilbert Agrazani Roring',
        jenisKelamin: 'MALE',
        jabatan: 'Enumerator',
        email: 'wilbetroring@gmail.com',
        wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id
      },
      {
        namaLengkap: 'Injilina Wilar',
        jenisKelamin: 'FEMALE',
        jabatan: 'Enumerator',
        email: 'wilarinjil@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Selfi Haryanto',
        jenisKelamin: 'FEMALE',
        jabatan: 'Tenaga Kesehatan',
        email: 'haryantoselfi211@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Juliana Suabing',
        jenisKelamin: 'FEMALE',
        jabatan: 'Tenaga Kesehatan',
        email: 'juanasuabing@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Rodney Mombalu',
        jenisKelamin: 'MALE',
        jabatan: 'Tenaga Kesehatan',
        email: 'rodneymathewz@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Kecia Wowiling',
        jenisKelamin: 'FEMALE',
        jabatan: 'Pengajar',
        email: 'wowiling.kecia2000@gmail.com',
        wilayahId: manadoWilayah.id
      },
      {
        namaLengkap: 'Fernando Wibowo',
        jenisKelamin: 'MALE',
        jabatan: 'Pengajar',
        email: 'fernandowibowo14.fw@gmail.com',
        wilayahId: manadoWilayah.id
      }
    ];

    // Create each volunteer
    console.log('Creating volunteers...');
    for (const volunteerData of volunteersData) {
      // Check if volunteer already exists
      const existingVolunteer = await prisma.volunteer.findUnique({
        where: { email: volunteerData.email }
      });

      // Complete volunteer data with required fields
      const completeVolunteerData = {
        ...volunteerData,
        tempatLahir: 'Manado',
        tanggalLahir: getRandomBirthDate(),
        alamatDomisili: 'Manado',
        kewarganegaraan: 'Indonesia',
        nomorHP: getRandomPhone(),
        status: 'ACTIVE',
        profileImage: `https://ik.imagekit.io/bakubantu/volunteers/${volunteerData.namaLengkap.toLowerCase().replace(/ /g, '-')}.jpg`
      };

      if (!existingVolunteer) {
        // Create new volunteer
        await prisma.volunteer.create({
          data: completeVolunteerData
        });
        console.log(`Created volunteer: ${volunteerData.namaLengkap}`);
      } else {
        // Update existing volunteer
        await prisma.volunteer.update({
          where: { id: existingVolunteer.id },
          data: completeVolunteerData
        });
        console.log(`Updated volunteer: ${volunteerData.namaLengkap}`);
      }
    }

    // Create some sample yayasans
    console.log('Creating sample yayasans...');
    const yayasans = [
      {
        namaYayasan: 'Yayasan Kasih Nusantara',
        alamatYayasan: 'Jl. Sam Ratulangi No. 10, Manado',
        emailYayasan: 'kasihnusantara@gmail.com',
        kontakYayasan: [
          { nama_kontak: 'Budi Santoso', nomor_telepon: '08123456789' },
          { nama_kontak: 'Dewi Lestari', nomor_telepon: '08234567890' }
        ]
      },
      {
        namaYayasan: 'Yayasan Cinta Kasih',
        alamatYayasan: 'Jl. Piere Tendean No. 25, Manado',
        emailYayasan: 'cintakasih@gmail.com',
        kontakYayasan: [
          { nama_kontak: 'Siti Rahayu', nomor_telepon: '08345678901' }
        ]
      },
      {
        namaYayasan: 'Yayasan Pelita Harapan',
        alamatYayasan: 'Jl. Ahmad Yani No. 15, Manado',
        emailYayasan: 'pelitaharapan@gmail.com',
        kontakYayasan: [
          { nama_kontak: 'Anton Wijaya', nomor_telepon: '08456789012' },
          { nama_kontak: 'Maria Susanti', nomor_telepon: '08567890123' }
        ]
      }
    ];

    for (const yayasanData of yayasans) {
      const existingYayasan = await prisma.yayasan.findFirst({
        where: { 
          namaYayasan: yayasanData.namaYayasan 
        }
      });

      if (!existingYayasan) {
        await prisma.yayasan.create({
          data: {
            ...yayasanData,
            kontakYayasan: yayasanData.kontakYayasan
          }
        });
        console.log(`Created yayasan: ${yayasanData.namaYayasan}`);
      } else {
        console.log(`Yayasan already exists: ${yayasanData.namaYayasan}`);
      }
    }

    // Create sample pantis
    console.log('Creating sample pantis...');
    const createdYayasans = await prisma.yayasan.findMany();
    if (createdYayasans.length > 0) {
      const pantis = [
        {
          namaPanti: 'Panti Asuhan Kasih Bunda',
          deskripsiSingkat: 'Panti asuhan yang fokus pada anak-anak yatim piatu dan terlantar',
          yayasanId: createdYayasans[0].id,
          wilayahId: manadoWilayah.id,
          fotoUtama: 'https://ik.imagekit.io/bakubantu/panti-photos/panti-kasih-bunda.jpg',
          detailPanti: {
            fokusPelayanan: 'Anak Yatim Piatu',
            alamatLengkap: 'Jl. Sam Ratulangi No. 10, Manado, Sulawesi Utara',
            deskripsiLengkap: 'Panti Asuhan Kasih Bunda didirikan pada tahun 2000 dengan fokus utama merawat dan mendidik anak-anak yatim piatu serta terlantar. Kami menyediakan tempat tinggal, pendidikan, dan pelatihan keterampilan untuk mempersiapkan anak-anak menghadapi masa depan.',
            jumlahPengasuh: 5,
            jumlahPenghuni: { laki_laki: 15, perempuan: 20 },
            kategoriKebutuhan: ['Sembako', 'Peralatan Sekolah', 'Peralatan Mandi', 'Obat-obatan'],
            sumbanganDiterima: ['Pangan', 'Sandang', 'Tunai', 'Kebutuhan Asuh']
          }
        },
        {
          namaPanti: 'Panti Asuhan Pelita Kasih',
          deskripsiSingkat: 'Panti asuhan yang berfokus pada pendidikan dan pengembangan bakat anak',
          yayasanId: createdYayasans[1].id,
          wilayahId: minahasaWilayah ? minahasaWilayah.id : manadoWilayah.id,
          fotoUtama: 'https://ik.imagekit.io/bakubantu/panti-photos/panti-pelita-kasih.jpg',
          detailPanti: {
            fokusPelayanan: 'Anak Putus Sekolah',
            alamatLengkap: 'Jl. Piere Tendean No. 25, Tondano, Minahasa, Sulawesi Utara',
            deskripsiLengkap: 'Panti Asuhan Pelita Kasih berfokus pada pendidikan dan pengembangan bakat anak-anak. Kami memiliki program pendidikan formal dan ekstrakurikuler untuk membantu anak-anak mengembangkan potensi mereka secara maksimal.',
            jumlahPengasuh: 8,
            jumlahPenghuni: { laki_laki: 25, perempuan: 18 },
            kategoriKebutuhan: ['Sembako', 'Peralatan Sekolah', 'Buku', 'Alat Musik'],
            sumbanganDiterima: ['Pangan', 'Sandang', 'Tunai', 'Buku', 'Alat Musik']
          }
        },
        {
          namaPanti: 'Panti Asuhan Harapan Bangsa',
          deskripsiSingkat: 'Panti asuhan dengan fokus pada pendidikan dan keterampilan hidup',
          yayasanId: createdYayasans[2].id,
          wilayahId: tomohonWilayah ? tomohonWilayah.id : manadoWilayah.id,
          fotoUtama: 'https://ik.imagekit.io/bakubantu/panti-photos/panti-harapan-bangsa.jpg',
          detailPanti: {
            fokusPelayanan: 'Anak Terlantar',
            alamatLengkap: 'Jl. Wolter Monginsidi No. 15, Tomohon, Sulawesi Utara',
            deskripsiLengkap: 'Panti Asuhan Harapan Bangsa didirikan untuk memberikan harapan dan masa depan bagi anak-anak terlantar melalui pendidikan dan pelatihan keterampilan hidup. Kami menyediakan berbagai program pelatihan keterampilan seperti menjahit, memasak, dan komputer.',
            jumlahPengasuh: 6,
            jumlahPenghuni: { laki_laki: 20, perempuan: 25 },
            kategoriKebutuhan: ['Sembako', 'Peralatan Sekolah', 'Peralatan Keterampilan', 'Komputer'],
            sumbanganDiterima: ['Pangan', 'Sandang', 'Tunai', 'Peralatan Keterampilan']
          }
        }
      ];

      for (const pantiData of pantis) {
        const existingPanti = await prisma.panti.findFirst({
          where: { 
            namaPanti: pantiData.namaPanti 
          }
        });

        if (!existingPanti) {
          const { detailPanti, ...pantiOnly } = pantiData;
          
          // Create the panti first
          const createdPanti = await prisma.panti.create({
            data: {
              ...pantiOnly,
              jumlahAnak: detailPanti.jumlahPenghuni.laki_laki + detailPanti.jumlahPenghuni.perempuan
            }
          });
          
          // Then create the detail
          await prisma.detailPanti.create({
            data: {
              ...detailPanti,
              pantiId: createdPanti.id
            }
          });
          
          console.log(`Created panti: ${pantiData.namaPanti}`);
        } else {
          console.log(`Panti already exists: ${pantiData.namaPanti}`);
        }
      }
    }

    console.log('Seed process completed successfully!');
  } catch (error) {
    console.error('Error during seed process:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });