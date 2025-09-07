const dbServices = require("../services/dbServices");
const common = require("../utils/common");
const CONSTANTS = require("../utils/constants");

const authMiddleware = async (request, response, next) => {
    try{
        let token = request.headers.authorization || request.cookies.auth_token;
        if(request.headers.authorization && request.headers.authorization.startsWith("Bearer ")){
            let temp = token.slice(7);
            token = temp;
        }
        const decoded = common.decryptToken(token);
        if(decoded && decoded.userId){
            const rows = await dbServices.execute('SELECT id, first_name, last_name, email, role, balance, risk_appetite FROM users WHERE id = ?', [decoded.userId]);
            request.user = rows[0];
        }
        next();
    }catch(err){
        console.log(err);
        return response.status(401).json({ message: CONSTANTS.RESPONSE_MESSAGES.UNAUTHORIZED})
    }

}

module.exports = authMiddleware;