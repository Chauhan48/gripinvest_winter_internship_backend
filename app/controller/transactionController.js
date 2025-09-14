const dbServices = require("../services/dbServices");

const transactionController = {};

transactionController.fetchTransactions = async (request, response) => {
  try {
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { user_id, email } = request.query;

    let whereClauses = [];
    let params = [];

    if (user_id) {
      whereClauses.push("user_id = ?");
      params.push(user_id);
    }
    if (email) {
      whereClauses.push("email LIKE ?");
      params.push(`%${email}%`);
    }
    const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    const query = `
      SELECT * FROM transaction_logs
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const transactions = await dbServices.execute(query, params);

    const countQuery = `
      SELECT COUNT(*) as total FROM transaction_logs
      ${whereSQL}
    `;
    const countResult = await dbServices.execute(countQuery, whereClauses.length ? params.slice(0, -2) : []);

    return response.status(200).json({
      transactions,
      total: countResult[0].total,
      page,
      limit
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
};


module.exports = transactionController;