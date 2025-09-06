const express = require('express');
const logger = require('../middleware/logger');
const userRoutes = require('../routes/userRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')());
app.use(require('cookie-parser')());
app.use(logger);
app.use('/user', userRoutes);

module.exports = app;