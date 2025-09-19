const mysql = require('mysql2/promise');
const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT} = require('../../config/config')

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0, 
  multipleStatements: true,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

module.exports = pool