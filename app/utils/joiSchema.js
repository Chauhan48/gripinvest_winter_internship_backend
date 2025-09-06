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

joiSchema.forstoPasswordSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    })
}

joiSchema.verifyPasswordSchema = {
    body: joi.object({
        otp: joi.number().min(6).required(),
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

module.exports = joiSchema;