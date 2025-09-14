const transactionController = require('../controller/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const checkForAdmin = require('../middleware/checkForAdmin');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');

const transactionRoutes = require('express').Router();

transactionRoutes.get('/transactions', authMiddleware, checkForAdmin, schemaValidation(joiSchema.transactionSchema), transactionController.fetchTransactions);

module.exports = transactionRoutes;