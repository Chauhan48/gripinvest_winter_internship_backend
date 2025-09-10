const common = require('../utils/common');
const dbServices = require('../services/dbServices');

const logger = async (request, response, next) => {
  response.on('finish', async () => {
    let userId = null, userEmail = null;
    let endpoint = request.originalUrl;
    let http_method = request.method;
    let status_code = response.statusCode;
    let error_message = response.locals && response.locals.error_message ? response.locals.error_message : null;

    try {
      if (!request.user) {
        if (request.cookies && request.cookies.auth_token) {
          const decode = common.decryptToken(request.cookies.auth_token);
          userId = decode.userId;
          const rows = await dbServices.execute('SELECT email FROM users WHERE id = ?', [userId]);
          if (rows && rows.length > 0) {
            userEmail = rows[0].email;
          }
        }
      } else {
        userId = request.user.id;
        userEmail = request.user.email;
      }

      await dbServices.execute(
        `INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, userEmail, endpoint, http_method, status_code, error_message]
      );
      console.log(
        `[LOG] userId=${userId} | email=${userEmail} | endpoint=${request.originalUrl} | method=${request.method} | status=${response.statusCode}`
      );

    } catch (err) {
      console.error('Logger error:', err);
    }
  });

  next();
};

module.exports = logger;