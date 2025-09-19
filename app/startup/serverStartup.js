const express = require('express');
const logger = require('../middleware/logger');
const userRoutes = require('../routes/userRoutes');
const productRoutes = require('../routes/productRoutes');
const investmentRoutes = require('../routes/investmentRoutes');
const dbServices = require('../services/dbServices');
const adminRoutes = require('../routes/adminRoutes');
const cors = require('cors');
const transactionRoutes = require('../routes/transactionRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4040',
    'http://grip-invest-frontend:5173',  // Docker internal network
    'http://grip-invest-admin-pannel:4040', // Docker internal network
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4040'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
app.use(require('cookie-parser')());
app.use(logger);
app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/user', investmentRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', transactionRoutes);

app.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    dbStatus: 'unknown',
  };

  try {
    await dbServices.execute('SELECT 1');
    healthcheck.dbStatus = 'up';
    res.json(healthcheck);
  } catch (error) {
    healthcheck.message = 'Database connection failed';
    healthcheck.dbStatus = 'down';
    res.status(503).json(healthcheck);
  }
});

module.exports = app;