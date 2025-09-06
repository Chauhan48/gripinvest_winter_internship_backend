const productRoutes = require('express').Router();
const productController = require('../controller/productController');
const authMiddleware = require('../middleware/authMiddleware');
const checkForAdmin = require('../middleware/checkForAdmin');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');


productRoutes.post('/add-product', authMiddleware, checkForAdmin, schemaValidation(joiSchema.addProductSchema), productController.addProduct);
productRoutes.post('/delete-product', authMiddleware, checkForAdmin, schemaValidation(joiSchema.deleteProductSchema), productController.removeProduct);

module.exports = productRoutes;