const productRoutes = require('express').Router();
const productController = require('../controller/productController');
const authMiddleware = require('../middleware/authMiddleware');
const checkForAdmin = require('../middleware/checkForAdmin');
const { schemaValidation } = require('../middleware/schemaValidation');
const joiSchema = require('../utils/joiSchema');


productRoutes.post('/add-product', authMiddleware, checkForAdmin, schemaValidation(joiSchema.addProductSchema), productController.addProduct);

productRoutes.delete('/delete-product/:productId', authMiddleware, checkForAdmin, schemaValidation(joiSchema.deleteProductSchema), productController.removeProduct);

productRoutes.patch('/update-product', authMiddleware, checkForAdmin, schemaValidation(joiSchema.updateProductSchema), productController.updateProduct);

productRoutes.get('/list-products', authMiddleware, schemaValidation(joiSchema.productListingSchema), productController.productListing);

productRoutes.get('/suggestions', authMiddleware, productController.suggestProducts);

module.exports = productRoutes;