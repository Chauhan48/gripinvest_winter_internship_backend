const dbServices = require("../services/dbServices");
const common = require("../utils/common");
const CONSTANTS = require("../utils/constants");

const userController = {};

userController.signup = async (request, response) => {
    try {
        const {first_name, last_name, email, password_hash} = request.body;
        const rows = await dbServices.find('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return response.status(409).json({ message: CONSTANTS.RESPONSE_MESSAGES.EMAIL_ALREADY_EXISTS });
        }
        const hashPassword = await common.hashPassword(password_hash);

        const query = `
        INSERT INTO users (id, first_name, last_name, email, password_hash, risk_appetite)
        VALUES (UUID(), ?, ?, ?, ?, ?)`;
        const params = [
            first_name,
            last_name || null,
            email,
            hashPassword,
            'moderate',
        ];
        await dbServices.addRow(query, params);

        const token = common.generateToken({ userEmail: email });
        response.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.REGISTRATION_SUCCESS });
    } catch (err) {
        console.log(err);
        return response.status(500).json({ message: CONSTANTS.RESPONSE_MESSAGES.REGISTRATION_ERROR });
    }
}

userController.login = async (request, response) => {
    try{
        const { email, password_hash } = request.body;
        const rows = await dbServices.find('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length == 0) {
            throw new Error(CONSTANTS.RESPONSE_MESSAGES.INVALID_CREDENTIALS);
        }
        const password = await common.comparePassword(password_hash, rows[0].password_hash);
        if(!password){
            throw new Error(CONSTANTS.RESPONSE_MESSAGES.INVALID_CREDENTIALS);
        }
        const token = common.generateToken({ userEmail: email });
        response.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.LOGIN_SUCCESS });

    }catch(err){
        return response.status(401).json({ message: err.message })
    }
}

module.exports = userController;