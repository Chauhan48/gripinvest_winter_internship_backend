const investmentController = require('../controller/investmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');

const investmentRoutes = require('express').Router();

investmentRoutes.post('/investment', authMiddleware, schemaValidation(joiSchema.investSchema), investmentController.invest);

investmentRoutes.get('/list-investments', authMiddleware, investmentController.listInvestments);

module.exports = investmentRoutes;