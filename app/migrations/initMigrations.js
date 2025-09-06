const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('../../config/config');

const initMigrations = async () => {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  const createDbAndTables = `
    CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
    USE \`${DB_NAME}\`;

    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      risk_appetite ENUM('low','moderate','high') DEFAULT 'moderate',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      otp_code VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS investment_products (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      investment_type ENUM('bond','fd','mf','etf','other') NOT NULL,
      tenure_months INT NOT NULL,
      annual_yield DECIMAL(5,2) NOT NULL,
      risk_level ENUM('low','moderate','high') NOT NULL,
      min_investment DECIMAL(12,2) DEFAULT 1000.00,
      max_investment DECIMAL(12,2),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS investments (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      product_id CHAR(36) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      invested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active','matured','cancelled') DEFAULT 'active',
      expected_return DECIMAL(12,2),
      maturity_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES investment_products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transaction_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      user_id CHAR(36),
      email VARCHAR(255),
      endpoint VARCHAR(255) NOT NULL,
      http_method ENUM('GET','POST','PUT','DELETE') NOT NULL,
      status_code INT NOT NULL,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;

  try {
    await connection.query(createDbAndTables);
    console.log('Database and tables created.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

module.exports = initMigrations;