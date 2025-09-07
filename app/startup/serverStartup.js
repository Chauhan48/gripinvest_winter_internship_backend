const express = require('express');
const logger = require('../middleware/logger');
const userRoutes = require('../routes/userRoutes');
const productRoutes = require('../routes/productRoutes');
const investmentRoutes = require('../routes/investmentRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')({
  origin: true,
  credentials: true,
}));
app.use(require('cookie-parser')());
app.use(logger);
app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/user', investmentRoutes);

module.exports = app;