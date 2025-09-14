const joi = require('joi');

const joiSchema = {};

joiSchema.registrationSchema = {
    body: joi.object({
        first_name: joi.string().min(2).max(20).required(),
        last_name: joi.string().min(2).max(20).required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password_hash: joi.string().min(6).required(),
        risk_appetite: joi.string().optional()
    })
}

joiSchema.loginSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password_hash: joi.string().min(6).required()
    })
}

joiSchema.forgotPasswordSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    })
}

joiSchema.vefifyOtpSchema = {
    body: joi.object({
        otp: joi.number().min(6).required(),
    })
}

joiSchema.verifyPasswordSchema = {
    body: joi.object({
        password_hash: joi.string().min(6).required()
    })
}

joiSchema.addProductSchema = {
    body: joi.object({
        name: joi.string().required(), 
        investment_type: joi.string().valid('bond', 'fd', 'mf', 'etf', 'other').required(), 
        tenure_months: joi.number().required(), 
        annual_yield: joi.number().required(), 
        risk_level: joi.valid('low','moderate','high').required(), 
        min_investment: joi.number().min(1000.00).precision(2).required(),
        max_investment: joi.number().precision(2).required().when('min_investment', {
                is: joi.number().required(),
                then: joi.number().greater(joi.ref('min_investment')),
            }),
    })
}

joiSchema.deleteProductSchema = {
    body: joi.object({
        productId: joi.string().required()
    })
}

joiSchema.updateProductSchema = {
    body: joi.object({
        name: joi.string().required(), 
        investment_type: joi.string().valid('bond', 'fd', 'mf', 'etf', 'other').required(), 
        tenure_months: joi.number().required(), 
        annual_yield: joi.number().required(), 
        risk_level: joi.valid('low','moderate','high').required(), 
        min_investment: joi.number().min(1000.00).precision(2).required(),
        max_investment: joi.number().precision(2).required().when('min_investment', {
                is: joi.number().required(),
                then: joi.number().greater(joi.ref('min_investment')),
            }),
        description: joi.string().required(),
        productId: joi.string().required(),
    })
}

joiSchema.productListingSchema = {
    query: joi.object({
        page: joi.number().required(),
        limit: joi.number().required(),
        investment_type: joi.string().valid('bond', 'fd', 'mf', 'etf', 'other').optional(),
        risk_level: joi.string().valid('low', 'medium', 'high').optional()
    })
}

joiSchema.investSchema = {
    body: joi.object({
      productId: joi.string().required(),
      amount: joi.number().positive().required()
    })
  }

joiSchema.updateProfileSchema = {
    body: joi.object({
        first_name: joi.string().required(),
        last_name: joi.string().required(),
        password: joi.string().required(),
        risk_appetite: joi.string().required()
    })
}

joiSchema.transactionSchema = {
    query: joi.object({
        page: joi.number().required(),
        limit: joi.number().required(),
        user_id: joi.string().optional(),
        email: joi.string().optional()
    })
}

module.exports = joiSchema;