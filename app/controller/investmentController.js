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

module.exports = investmentController;