const dbServices = require("../services/dbServices");
const common = require("../utils/common");
const CONSTANTS = require("../utils/constants");

const authMiddleware = async (request, response, next) => {
    try{
        const token = request.cookies.auth_token || request.headers.authorization;
        const decoded = common.decryptToken(token);
        if(decoded && decoded.userId){
            const rows = await dbServices.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);
            request.user = rows[0];
        }
        next();
    }catch(err){
        console.log(err);
        return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.UNAUTHORIZED})
    }

}

module.exports = authMiddleware;