const userRoutes = require('express').Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');


userRoutes.post('/signup', schemaValidation(joiSchema.registrationSchema), userController.signup);

userRoutes.post('/login', schemaValidation(joiSchema.loginSchema), userController.login);

userRoutes.post('/forgot-password', schemaValidation(joiSchema.forgotPasswordSchema), userController.forgotPassword);

userRoutes.post('/verify-forgot-password', authMiddleware, schemaValidation(joiSchema.verifyPasswordSchema), userController.verifyPassword);

userRoutes.get('/dashboard', authMiddleware, userController.dashboard);

module.exports = userRoutes;