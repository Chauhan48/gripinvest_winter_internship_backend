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

        const passwordStrenght = await common.checkPasswordStrength(password_hash);
        if(passwordStrenght.score < 3){
            return response.status(400).json({
                message: CONSTANTS.RESPONSE_MESSAGES.WEAK_PASSWORD,
                suggestion: passwordStrenght.feedback.suggestions,
                warning: passwordStrenght.feedback.warning
            })
        }

        const hashPassword = await common.hashPassword(password_hash);
        const { v4: uuidv4 } = await import('uuid');
        const userId = uuidv4();

        const query = `
        INSERT INTO users (id, first_name, last_name, email, password_hash, risk_appetite)
        VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [
            userId,
            first_name,
            last_name || null,
            email,
            hashPassword,
            'moderate',
        ];
        await dbServices.addRow(query, params);

        const token = common.generateToken({ userId: userId });
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
        const token = common.generateToken({ userId: rows[0].id });
        response.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.LOGIN_SUCCESS });

    }catch(err){
        return response.status(401).json({ message: err.message })
    }
}

userController.forgotPassword = async (request, response) => {
    
}

module.exports = userController;