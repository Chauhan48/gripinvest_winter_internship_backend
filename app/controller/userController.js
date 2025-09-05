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

        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.REGISTRATION_SUCCESS });
    } catch (err) {
        console.log(err);
        return response.status(500).json({ message: CONSTANTS.RESPONSE_MESSAGES.REGISTRATION_ERROR });
    }
}

module.exports = userController;