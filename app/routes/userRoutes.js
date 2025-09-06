const userRoutes = require('express').Router();
const userController = require('../controller/userController');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');


userRoutes.post('/signup', schemaValidation(joiSchema.registrationSchema), userController.signup);
userRoutes.post('/login', schemaValidation(joiSchema.loginSchema), userController.login);
userRoutes.post('/forgot-password', schemaValidation(joiSchema.forstoPasswordSchema), userController.forgotPassword);

module.exports = userRoutes;