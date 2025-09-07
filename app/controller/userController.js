const dbServices = require("../services/dbServices");
const common = require("../utils/common");
const CONSTANTS = require("../utils/constants");
const { sendEmail } = require("../utils/mailer");

const userController = {};

userController.signup = async (request, response) => {
    try {
        const { first_name, last_name, email, password_hash } = request.body;
        const rows = await dbServices.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return response.status(409).json({ message: CONSTANTS.RESPONSE_MESSAGES.EMAIL_ALREADY_EXISTS });
        }

        const passwordStrenght = await common.checkPasswordStrength(password_hash);
        if (passwordStrenght.score < 3) {
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
        await dbServices.execute(query, params);

        const token = common.generateToken({ userId: userId });
        response.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none',
            secure: false
        });

        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.REGISTRATION_SUCCESS });
    } catch (err) {
        console.log(err);
        return response.status(500).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR });
    }
}

userController.login = async (request, response) => {
    try {
        const { email, password_hash } = request.body;
        const rows = await dbServices.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length == 0) {
            throw new Error(CONSTANTS.RESPONSE_MESSAGES.INVALID_CREDENTIALS);
        }
        const password = await common.comparePassword(password_hash, rows[0].password_hash);
        if (!password) {
            throw new Error(CONSTANTS.RESPONSE_MESSAGES.INVALID_CREDENTIALS);
        }
        const token = common.generateToken({ userId: rows[0].id });
        response.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: false 
        });
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.LOGIN_SUCCESS });

    } catch {
        return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.INVALID_CREDENTIALS })
    }
}

userController.forgotPassword = async (request, response) => {
    try {
        const { email } = request.body;
        const rows = await dbServices.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length == 0) {
            throw new Error(CONSTANTS.RESPONSE_MESSAGES.INVALID_EMAIL);
        }

        const resetToken = common.generateShortToken({ userId: rows[0].id });

        const otp = common.generateOTP();
        const hashOtp = await common.hashOtp(otp);
        const expiresDate = new Date(Date.now() + 10 * 60 * 1000);
        const query = `INSERT INTO otp_codes (user_id, otp_code, expires_at)
        VALUES (?, ?, ?)`;
        const params = [
            rows[0].id,
            hashOtp,
            expiresDate
        ];
        await dbServices.execute(query, params);

        const htmlContent = await common.resetPasswordTemplate(rows[0].first_name, otp);

        await sendEmail({
            to: email,
            subject: 'Password Reset OTP',
            html: htmlContent
        })

        return response.status(200).json({
            message: CONSTANTS.RESPONSE_MESSAGES.FORGOT_PASSWORD_SUCCESS,
            token: resetToken
        })
    } catch (err) {
        console.log(err);
        return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR })
    }
}

userController.verifyPassword = async (request, response) => {
    try{
        const { otp, password_hash } = request.body;
        const user = request.user;
        // check for otp;
        const rows = await dbServices.execute('SELECT * FROM otp_codes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [user.id]
        );

        if(rows.length === 0){
            throw new Error();
        }
        
        const checkOtp = await common.compareOtp(otp, rows[0].otp_code);
        if(!checkOtp){
            return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.INVALID_OTP });
        }
        if(Date.now() > rows[0].expires_at)
        {
            return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.OTP_EXPIRED });
        }
        const passwordStrenght = await common.checkPasswordStrength(password_hash);
        if (passwordStrenght.score < 3) {
            return response.status(400).json({
                message: CONSTANTS.RESPONSE_MESSAGES.WEAK_PASSWORD,
                suggestion: passwordStrenght.feedback.suggestions,
                warning: passwordStrenght.feedback.warning
            })
        }
        const hashedPassword = await common.hashPassword(password_hash);
        const query = 'UPDATE users SET password_hash = ? WHERE email = ?';
        const params = [hashedPassword, user.email];
        await dbServices.execute(query, params);
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESS });
    }catch(err){
        console.log(err);
        return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR })
    }

}

userController.dashboard = async (request, response) => {
    const userData = request.user;
    // const investments = await dbServices.execute('SELECT id, user_id, product_id, amount, invested_at, status, expected_return, maturity_date FROM investments WHERE user_id = ?', [userData.id]);
    const totalInvestment = await dbServices.execute('SELECT SUM(amount) AS sum FROM investments WHERE user_id = ?', [userData.id])
    const totalProducts = await dbServices.execute('SELECT COUNT(*) AS total FROM investment_products')
    
    return response.status(200).json({ data: userData, 
        total_investment: totalInvestment[0].sum, 
        total_products: totalProducts[0].total 
    });
}

module.exports = userController;