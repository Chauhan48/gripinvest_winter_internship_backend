const express = require('express');
const logger = require('../middleware/logger');
const userRoutes = require('../routes/userRoutes');
const productController = require('../controller/productController');
const productRoutes = require('../routes/productRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());
app.use(require('cookie-parser')());
app.use(logger);
app.use('/user', userRoutes);
app.use('/products', productRoutes);

module.exports = app;