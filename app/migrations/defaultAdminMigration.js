const pool = require('../startup/databaseConnection');
const { ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../config/config');
const common = require('../utils/common');



const defaultAdminMigration = async () => {
    const [result] = await pool.query('SELECT * FROM users WHERE role = ?', ['admin']);
    if(result.length == 0){
        const password_hash = await common.hashPassword(ADMIN_PASSWORD);
        await pool.query(`INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`, [ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL, password_hash, 'admin']);
        console.log('Default admin added to database');
    }
}

module.exports = defaultAdminMigration;