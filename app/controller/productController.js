const aiServices = require("../services/aiServices");
const dbServices = require("../services/dbServices");
const CONSTANTS = require("../utils/constants");

const productController = {};

productController.addProduct = async (request, response) => {

    try{
        const {name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment} = request.body
    
        const productDescription = await aiServices.generateProductDescription({
            name, 
            investment_type, 
            tenure_months, 
            annual_yield, 
            risk_level, 
            min_investment, 
            max_investment
        });
    
        const query = `
                INSERT INTO investment_products (name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            name, 
            investment_type, 
            tenure_months, 
            annual_yield, 
            risk_level, 
            min_investment, 
            max_investment, 
            productDescription
        ];
        await dbServices.execute(query, params);
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.PRODUCT_ADD_SUCCESS });
    }catch(err){
        console.log(err);
        return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR });
    }
}

productController.removeProduct = async (request, response) => {
    try{
        const { productId } = request.body;
        const query = `
                DELETE from investment_products WHERE id = ?`;
        const params = [productId];
        await dbServices.execute(query, params);
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.PRODUCT_DELETE_SUCCESS })
    }catch(err){
        console.log(err);
        return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR });
    }
}

productController.updateProduct = async (request, response) => {
  try {
    const {
      productId,
      name,
      investment_type,
      tenure_months,
      annual_yield,
      risk_level,
      min_investment,
      max_investment,
      description
    } = request.body;

    if (!productId) {
      return response.status(400).json({ message: "Product ID is required" });
    }

    const query = `
      UPDATE investment_products 
      SET 
        name = ?, 
        investment_type = ?, 
        tenure_months = ?, 
        annual_yield = ?, 
        risk_level = ?, 
        min_investment = ?, 
        max_investment = ?, 
        description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`;

    const params = [
      name,
      investment_type,
      tenure_months,
      annual_yield,
      risk_level,
      min_investment,
      max_investment,
      description,
      productId
    ];

    const result = await dbServices.execute(query, params);

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Product not found" });
    }

    return response
      .status(200)
      .json({ message: CONSTANTS.RESPONSE_MESSAGES.PRODUCT_UPDATE_SUCCESS });
  } catch (err) {
    console.error("Error updating product:", err);
    return response
      .status(500)
      .json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR });
  }
};

module.exports = productController;