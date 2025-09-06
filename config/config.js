require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME ||  'test',
    TOKEN_SECRET: process.env.TOKEN_SECRET || '####',
    SMTP_EMAIL: process.env.SMTP_EMAIL || '',
    SMTP_PASS: process.env.SMTP_PASS || ''
};