const pool = require('../startup/databaseConnection');

const dbServices = {};

dbServices.find = async (query, params = []) => {
    const [rows] = await pool.query(query, params);
    return rows;
}

dbServices.addRow = async (query, params = []) => {
    const [result] = await pool.query(query, params);
    return result;
}

module.exports = dbServices;