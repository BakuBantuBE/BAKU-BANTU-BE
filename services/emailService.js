const nodemailer = require('nodemailer');

// Create transporter - configure once for reuse
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Port for SSL
  secure: true, // SSL enabled
  auth: {
    user: process.env.EMAIL_USER, // Gmail email
    pass: process.env.EMAIL_PASS, // Gmail app password
  },
  debug: true, // Enable debugging for logs
  logger: true, // Enable logging
});

// Function to send email
const sendEmail = async (recipients, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: `"Baku Bantu" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(recipients) ? recipients.join(', ') : recipients,
      subject: subject,
      html: message,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Template for activation email
const sendActivationEmail = async (volunteer) => {
    const subject = 'Selamat! Kamu Diterima Menjadi Volunteer Baku Bantu 🎉';
    
    const message = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background-color: #ffeb3b; padding: 20px; text-align: center; }
          .header h2 { color: #333; margin: 0; font-size: 24px; }
          .content { padding: 30px; color: #333; line-height: 1.6; }
          .content p { margin: 0 0 15px; }
          .content strong { color: #ff5722; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .footer a { color: #ff5722; text-decoration: none; }
          .button { display: inline-block; background-color: #ff5722; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 25px; margin: 15px 0; }
          @media only screen and (max-width: 600px) {
            .content { padding: 20px; }
            .header h2 { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Halo ${volunteer.namaLengkap},</h2>
          </div>
          <div class="content">
            <p><strong>Selamat! 🎉</strong></p>
            <p>Kami sangat senang mengabarkan bahwa kamu resmi menjadi Volunteer Baku Bantu! Terima kasih atas antusiasme dan semangatmu untuk bergabung dalam gerakan kebaikan ini.</p>
            <p>Sebagai volunteer, kamu akan berbagi kebahagiaan, membantu masyarakat, dan menjadi bagian dari komunitas yang penuh dukungan serta berdampak nyata.</p>
            <p>Informasi lebih lanjut tentang tugas dan jadwal akan kami kirimkan segera melalui email berikutnya.</p>
            <p>Punya pertanyaan? Jangan ragu untuk menghubungi kami kapan saja!</p>
            <p>Selamat bergabung di keluarga Baku Bantu! Yuk, kita wujudkan kebaikan bersama 💛</p>
          </div>
          <div class="footer">
            <p>Salam hangat,<br><strong>Krisan Valerie Sangari & Tim Baku Bantu</strong><br>
            <a href="mailto:bakubantusulut@gmail.com">bakubantusulut@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return sendEmail(volunteer.email, subject, message);
  };

// Template for deactivation email
const sendDeactivationEmail = async (volunteer) => {
    const today = new Date().toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const subject = 'Informasi Status Keaktifan Volunteer Baku Bantu';
    
    const message = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
          .header h2 { color: #333; margin: 0; font-size: 24px; }
          .content { padding: 30px; color: #333; line-height: 1.6; }
          .content p { margin: 0 0 15px; }
          .content strong { color: #ff5722; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .footer a { color: #ff5722; text-decoration: none; }
          @media only screen and (max-width: 600px) {
            .content { padding: 20px; }
            .header h2 { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Halo ${volunteer.namaLengkap},</h2>
          </div>
          <div class="content">
            <p>Terima kasih atas segala dedikasi dan kebaikan yang telah kamu berikan selama menjadi bagian dari Baku Bantu. Setiap momen yang kamu luangkan sangat berarti bagi kami dan komunitas.</p>
            <p>Kami ingin memberitahu bahwa per ${today}, status kamu sebagai volunteer telah berubah menjadi tidak aktif.</p>
            <p>Namun, ini bukan akhir! Pintu Baku Bantu selalu terbuka untukmu. Jika suatu saat kamu ingin kembali berkontribusi, kami akan menyambutmu dengan tangan terbuka.</p>
            <p>Semoga perjalananmu bersama kami meninggalkan kenangan indah. Terima kasih telah menjadi bagian dari cerita kami 💛</p>
            <p>Sampai jumpa di waktu yang akan datang!</p>
          </div>
          <div class="footer">
            <p>Salam hangat,<br><strong>Krisan Valerie Sangari & Tim Baku Bantu</strong><br>
            <a href="mailto:bakubantusulut@gmail.com">bakubantusulut@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return sendEmail(volunteer.email, subject, message);
  };

// Template for admin creation email
const sendAdminCreationEmail = async (volunteer, defaultPassword) => {
    const subject = 'Selamat! Kamu Kini Admin Baku Bantu 🎉';
    
    const message = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background-color: #ffeb3b; padding: 20px; text-align: center; }
          .header h2 { color: #333; margin: 0; font-size: 24px; }
          .content { padding: 30px; color: #333; line-height: 1.6; }
          .content p { margin: 0 0 15px; }
          .content strong { color: #ff5722; }
          .content ul { margin: 15px 0; padding-left: 20px; }
          .content li { margin-bottom: 10px; }
          .button { display: inline-block; background-color: #ff5722; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 25px; margin: 15px 0; }
          .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .footer a { color: #ff5722; text-decoration: none; }
          .credentials { background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
          @media only screen and (max-width: 600px) {
            .content { padding: 20px; }
            .header h2 { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Halo ${volunteer.namaLengkap},</h2>
          </div>
          <div class="content">
            <p><strong>Selamat! 🎉</strong></p>
            <p>Kami sangat antusias mengumumkan bahwa kamu kini resmi menjadi Admin Baku Bantu! Terima kasih atas dedikasi luar biasa yang telah kamu tunjukkan sebagai volunteer.</p>
            <p>Sebagai admin, kamu akan memainkan peran penting dalam mengoordinasikan program dan memastikan kebaikan terus menyebar.</p>
            <div class="credentials">
              <p><strong>Detail Akun Admin:</strong></p>
              <p><strong>Email:</strong> ${volunteer.email}<br>
              <strong>Password:</strong> ${defaultPassword}</p>
            </div>
            <p>Langsung coba peran barumu dengan login ke dashboard admin:</p>
            <p style="text-align: center;">
              <a href="http://localhost:3000/login" class="button">🔗 Login ke Dashboard Admin</a>
            </p>
            <p>Dengan akun admin, kamu bisa:</p>
            <ul>
              <li>Memantau perkembangan kegiatan</li>
              <li>Mengakses fitur khusus untuk tim inti</li>
            </ul>
            <p>Kami sarankan untuk segera mengganti password setelah login demi keamanan. Jika ada kendala atau butuh bantuan dengan dashboard, tim kami siap membantu!</p>
            <p>Selamat atas langkah baru ini. Mari bersama wujudkan dampak yang lebih besar 💛</p>
          </div>
          <div class="footer">
            <p>Salam hangat,<br><strong>Krisan Valerie Sangari & Tim Baku Bantu</strong><br>
            <a href="mailto:bakubantusulut@gmail.com">bakubantusulut@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return sendEmail(volunteer.email, subject, message);
  };

module.exports = {
  sendEmail,
  sendActivationEmail,
  sendDeactivationEmail,
  sendAdminCreationEmail
};