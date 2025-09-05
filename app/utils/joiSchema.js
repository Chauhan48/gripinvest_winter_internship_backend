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

module.exports = joiSchema;