const dbServices = require('../services/dbServices');
const common = require('../utils/common');
const CONSTANTS = require('../utils/constants');

const adminController = {};

adminController.login = async (request, response) => {
    try {
        const { email, password_hash } = request.body;

        let checkEmail = await dbServices.execute('SELECT * FROM users WHERE email = ? AND role = "admin"', [email]);

        if (checkEmail.length == 0) {
            return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.UNAUTHORIZED });
        }

        let pass = await common.comparePassword(password_hash, checkEmail[0].password_hash);

        if (!pass) {
            return response.status(400).json({ message: CONSTANTS.RESPONSE_MESSAGES.INVALID_CREDENTIALS });
        }

        const token = common.generateToken({ userId: checkEmail[0].id });
        response.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: false
        });
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.LOGIN_SUCCESS });

    } catch (error) {
        console.log(error);
        return response.status(500).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR })
    }
}

adminController.dashboard = async (request, response) => {
    try {
        const [totalUsers] = await dbServices.execute(
            'SELECT COUNT(*) as totalUsers FROM users'
        );

        const [totalProducts] = await dbServices.execute(
            'SELECT COUNT(*) as totalProducts FROM investment_products'
        );

        const [totalInvestments] = await dbServices.execute(
            'SELECT SUM(amount) as totalInvestments FROM investments'
        );

        const mostSellingProducts = await dbServices.execute(
            'SELECT product_id, SUM(amount) as totalInvestments FROM investments GROUP BY product_id ORDER BY totalInvestments DESC LIMIT 3'
        );

        return response.status(200).json({totalProducts, totalUsers, totalInvestments, mostSellingProducts})

    } catch (error) {
        return response.status(500).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR })
    }
}

module.exports = adminController;