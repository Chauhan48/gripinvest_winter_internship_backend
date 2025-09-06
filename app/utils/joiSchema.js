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

module.exports = joiSchema;