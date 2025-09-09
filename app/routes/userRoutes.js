const userRoutes = require('express').Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');


userRoutes.post('/signup', schemaValidation(joiSchema.registrationSchema), userController.signup);

userRoutes.post('/login', schemaValidation(joiSchema.loginSchema), userController.login);

userRoutes.post('/forgot-password', schemaValidation(joiSchema.forgotPasswordSchema), userController.forgotPassword);

userRoutes.post('/verify-otp', authMiddleware, schemaValidation(joiSchema.vefifyOtpSchema), userController.verifyOtp);

userRoutes.post('/change-password', authMiddleware, schemaValidation(joiSchema.verifyPasswordSchema), userController.changePassword);

userRoutes.get('/dashboard', authMiddleware, userController.dashboard);

userRoutes.get('/portfolio-summary', authMiddleware, userController.portfolioSummary);

userRoutes.get('/logout', authMiddleware, userController.logout);

module.exports = userRoutes;