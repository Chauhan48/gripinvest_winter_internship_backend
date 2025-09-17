const investmentController = require('../../controllers/investmentController');
const dbServices = require('../../services/dbServices');
const mysql = require('mysql2/promise');
const CONSTANTS = require('../../utils/constants');
const httpMocks = require('node-mocks-http');

jest.mock('../../services/dbServices');
jest.mock('mysql2/promise');

describe('Investment Controller', () => {
  let mockConnection;
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock MySQL connection with transaction methods
    mockConnection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };
    mysql.createConnection.mockResolvedValue(mockConnection);
  });

  describe('invest', () => {
    it('should successfully invest and return 200', async () => {
      const req = httpMocks.createRequest({
        body: { productId: 'prod1', amount: 500 },
        user: { id: 'user1', balance: 1000 },
      });
      const res = httpMocks.createResponse();

      // Mock DB calls
      dbServices.execute
        .mockResolvedValueOnce([{ tenure_months: 12, annual_yield: 10 }]) // productDetail
        .mockResolvedValueOnce() // update user balance
        .mockResolvedValueOnce(); // insert investment record

      await investmentController.invest(req, res);

      expect(mysql.createConnection).toHaveBeenCalled();
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(dbServices.execute).toHaveBeenCalledTimes(3);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.INVESTMENT_SUCCESS);
    });

    it('should return 404 if product not found', async () => {
      const req = httpMocks.createRequest({
        body: { productId: 'prod1', amount: 500 },
        user: { id: 'user1', balance: 1000 },
      });
      const res = httpMocks.createResponse();

      dbServices.execute.mockResolvedValueOnce([]); // productDetail empty

      await investmentController.invest(req, res);

      expect(res.statusCode).toBe(404);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.PRODUCT_NOT_FOUND);
    });

    it('should return 400 if insufficient balance', async () => {
      const req = httpMocks.createRequest({
        body: { productId: 'prod1', amount: 1500 },
        user: { id: 'user1', balance: 1000 },
      });
      const res = httpMocks.createResponse();

      dbServices.execute.mockResolvedValueOnce([{ tenure_months: 12, annual_yield: 10 }]); // productDetail

      await investmentController.invest(req, res);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.INSUFFICIENT_BALANCE);
    });

    it('should rollback and return 500 on error', async () => {
      const req = httpMocks.createRequest({
        body: { productId: 'prod1', amount: 500 },
        user: { id: 'user1', balance: 1000 },
      });
      const res = httpMocks.createResponse();

      dbServices.execute.mockRejectedValueOnce(new Error('DB failure'));

      await investmentController.invest(req, res);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.ERROR);
    });
  });

  describe('listInvestments', () => {
    it('should return investments and charts successfully', async () => {
      const req = httpMocks.createRequest({
        user: { id: 'user1' }
      });
      const res = httpMocks.createResponse();

      const dummyInvestments = [{ id: 'inv1', product_name: 'Prod1', status: 'active' }];
      const dummyDistribution = [{ status: 'active', total_amount: 1000 }];
      const dummyTrend = [{ invest_date: '2025-09-10', total_amount: 500 }];

      dbServices.execute
        .mockResolvedValueOnce(dummyInvestments)
        .mockResolvedValueOnce(dummyDistribution)
        .mockResolvedValueOnce(dummyTrend);

      await investmentController.listInvestments(req, res);

      expect(dbServices.execute).toHaveBeenCalledTimes(3);
      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.investments).toBeDefined();
      expect(data.distributionChart).toBeDefined();
      expect(data.trendChart).toBeDefined();
    });

    it('should return 500 on error and log it', async () => {
      const req = httpMocks.createRequest({
        user: { id: 'user1' }
      });
      const res = httpMocks.createResponse();

      dbServices.execute.mockRejectedValueOnce(new Error('DB fail'));

      // To catch console.error calls without cluttering logs
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await investmentController.listInvestments(req, res);

      expect(res.statusCode).toBe(500);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.ERROR);

      console.error.mockRestore();
    });
  });
});
