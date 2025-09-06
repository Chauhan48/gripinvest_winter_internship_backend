const nodemailer = require('nodemailer');
const config = require('../../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.SMTP_EMAIL,
    pass: config.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: config.SMTP_EMAIL,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendEmail };
