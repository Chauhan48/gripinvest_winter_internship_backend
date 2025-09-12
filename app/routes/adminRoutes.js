const adminController = require('../controller/adminController');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');
const authMiddleware = require('../middleware/authMiddleware');
const checkForAdmin = require('../middleware/checkForAdmin');

const adminRoutes = require('express').Router();

adminRoutes.post('/login', schemaValidation(joiSchema.loginSchema),adminController.login);

adminRoutes.get('/dashboard', authMiddleware, checkForAdmin, adminController.dashboard);

module.exports = adminRoutes;