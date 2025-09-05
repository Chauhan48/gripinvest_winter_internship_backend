const userRoutes = require('express').Router();
const userController = require('../controller/userController');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');


userRoutes.post('/signup', schemaValidation(joiSchema.registrationSchema), userController.signup);

module.exports = userRoutes;