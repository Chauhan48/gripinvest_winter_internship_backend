const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const zxcvbn = require('zxcvbn');
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

module.exports = common;