const pool = require('../startup/databaseConnection');

const dbServices = {};

dbServices.execute = async (query, params = []) => {
    const [result] = await pool.query(query, params);
    return result;
}

module.exports = dbServices;