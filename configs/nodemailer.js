const nodemailer = require('nodemailer');

// Create and export reusable transporter object
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Port for SSL
  secure: true, // SSL enabled
  auth: {
    user: process.env.EMAIL_USER, // Gmail email from environment variables
    pass: process.env.EMAIL_PASS, // Gmail app password from environment variables
  },
  debug: process.env.NODE_ENV !== 'production', // Enable debugging in development
  logger: process.env.NODE_ENV !== 'production', // Enable logging in development
});

// Test if the configuration is valid
const verifyEmailConfig = async () => {
  try {
    const connectionCheck = await transporter.verify();
    console.log('Nodemailer configuration verified successfully');
    return connectionCheck;
  } catch (error) {
    console.error('Error verifying email configuration:', error);
    return false;
  }
};

module.exports = {
  transporter,
  verifyEmailConfig
};