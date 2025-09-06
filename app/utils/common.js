const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const zxcvbn = require('zxcvbn');
const path = require('path');
const fs = require('fs/promises');
const config = require('../../config/config');

const common = {};

// hash password;
common.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

// Compare plain password with hashed password
common.comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// generate JWT token
common.generateToken = (payload) => {
  return jwt.sign(payload, config.TOKEN_SECRET, { expiresIn: '24h' });
};

// hash OTP
common.hashOtp = async (otp) => {
    return await bcrypt.hash(otp.toString(), 10);
}
// compare plain otp with hashed otp
common.compareOtp = async (plainOtp, hashedOtp) => {
  return await bcrypt.compare(plainOtp.toString(), hashedOtp);
};

// generate short JWT token
common.generateShortToken = (payload) => {
  return jwt.sign(payload, config.TOKEN_SECRET, { expiresIn: '10m' }); 
}

// decrypt JWT token
common.decryptToken = (token) => {
  try {
    return jwt.verify(token, config.TOKEN_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

// check password strength
common.checkPasswordStrength = async (password) => {
  const result = zxcvbn(password);
  return result;
}

common.resetPasswordTemplate = async (first_name, otp) => {
  const templatePath = path.join(__dirname, '../../public', 'resetPasswordTemplate.html');
  let template = await fs.readFile(templatePath, 'utf-8');

  template = template.replace('{{FIRST_NAME}}', first_name);
  template = template.replace('{{OTP_CODE}}', otp);

  return template;
}

common.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

module.exports = common;