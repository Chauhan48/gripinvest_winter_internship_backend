const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD } = require('../../config/config');
const CONSTANTS = require('../utils/constants');
const dbServices = require('../services/dbServices');

const investmentController = {};

investmentController.invest = async (request, response) => {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        multipleStatements: true,
    });
    try {
        const { productId, amount } = request.body;
        const { id, balance } = request.user;

        const productDetail = await dbServices.execute('SELECT * FROM investment_products WHERE id = ?', [productId]);
        if (productDetail.length == 0) return response.status(404).json({ message: CONSTANTS.RESPONSE_MESSAGES.PRODUCT_NOT_FOUND });

        if (balance < amount) return response.status(400).json({ message: CONSTANTS.RESPONSE_MESSAGES.INSUFFICIENT_BALANCE });

        const investedAt = new Date();
        const maturityDate = new Date(investedAt);
        maturityDate.setMonth(maturityDate.getMonth() + productDetail[0].tenure_months);

        const rawExpectedReturn = (amount * productDetail[0].annual_yield * productDetail[0].tenure_months) / (100 * 12);
        const expectedReturn = Number(rawExpectedReturn.toFixed(2));


        await connection.beginTransaction();

        const newBalance = balance - amount;
        await dbServices.execute('UPDATE users SET balance = ? WHERE id = ?', [newBalance, id]);

        const insertQuery = `INSERT INTO investments (user_id, product_id, amount, expected_return, maturity_date, invested_at)
                         VALUES (?, ?, ?, ?, ?, ?)`;
        await dbServices.execute(insertQuery, [id, productId, amount, expectedReturn, maturityDate, investedAt]);

        await connection.commit();
        return response.status(200).json({ message: CONSTANTS.RESPONSE_MESSAGES.INVESTMENT_SUCCESS });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        return response.status(500).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR });
    } finally {
        connection.release();
    }
}

investmentController.listInvestments = async (request, response) => {
    try {
        const user = request.user;
        const investments = await dbServices.execute(
  `SELECT i.id, ip.name AS product_name, i.status, i.user_id, i.product_id, i.amount, i.invested_at, i.expected_return, i.maturity_date
   FROM investments i
   JOIN investment_products ip ON i.product_id = ip.id
   WHERE i.user_id = ?`,
  [user.id]
);

        const investmentDistribution = await dbServices.execute(`SELECT status, SUM(amount) as total_amount FROM investments WHERE user_id = ? GROUP BY status`, [user.id]);

        const distributionChart = {
            labels: investmentDistribution.map((row) => row.status),
            datasets: [
                {
                    label: "Investment Distribution",
                    data: investmentDistribution.map((row) => row.total_amount),
                    backgroundColor: ["#36A2EB", "#4BC0C0", "#FF6384"],
                },
            ],
        };

        const investmentTrend = await dbServices.execute(
            `SELECT DATE(invested_at) as invest_date, SUM(amount) as total_amount
       FROM investments
       WHERE user_id = ?
       GROUP BY DATE(invested_at)
       ORDER BY invest_date`,
            [user.id]
        );

        const trendChart = {
            labels: investmentTrend.map((row) => row.invest_date),
            datasets: [
                {
                    label: "Investments Over Time",
                    data: investmentTrend.map((row) => row.total_amount),
                    borderColor: "#36A2EB",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                },
            ],
        };

        return response.status(200).json({ investments, distributionChart, trendChart });
    } catch (err) {
        console.error(err);
        return response.status(500).json({ message: CONSTANTS.RESPONSE_MESSAGES.ERROR });
    }
}

module.exports = investmentController;