jest.mock('../../services/dbServices');
jest.mock('../../services/aiServices');

const productController = require('../../controller/productController');
const dbServices = require('../../services/dbServices');
const aiServices = require('../../services/aiServices');
const CONSTANTS = require('../../utils/constants');
const httpMocks = require('node-mocks-http');

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProduct', () => {
    it('should add a product and return success message', async () => {
      const req = httpMocks.createRequest({
        body: {
          name: 'Prod1',
          investment_type: 'TypeA',
          tenure_months: 12,
          annual_yield: 5,
          risk_level: 'low',
          min_investment: 100,
          max_investment: 1000
        }
      });
      const res = httpMocks.createResponse();

      aiServices.generateProductDescription.mockResolvedValueOnce('Generated description');
      dbServices.execute.mockResolvedValueOnce();

      await productController.addProduct(req, res);

      expect(aiServices.generateProductDescription).toHaveBeenCalledWith({
        name: 'Prod1',
        investment_type: 'TypeA',
        tenure_months: 12,
        annual_yield: 5,
        risk_level: 'low',
        min_investment: 100,
        max_investment: 1000
      });

      expect(dbServices.execute).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.PRODUCT_ADD_SUCCESS);
    });

    it('should return 401 on error', async () => {
      const req = httpMocks.createRequest({ body: {} });
      const res = httpMocks.createResponse();

      aiServices.generateProductDescription.mockRejectedValue(new Error('fail'));

      await productController.addProduct(req, res);

      expect(res.statusCode).toBe(401);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.ERROR);
    });
  });

  describe('removeProduct', () => {
    it('should remove product and return success message', async () => {
      const req = httpMocks.createRequest({ body: { productId: '123' } });
      const res = httpMocks.createResponse();

      dbServices.execute.mockResolvedValueOnce();

      await productController.removeProduct(req, res);

      expect(dbServices.execute).toHaveBeenCalledWith(expect.any(String), ['123']);
      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.PRODUCT_DELETE_SUCCESS);
    });

    it('should return 401 on error', async () => {
      const req = httpMocks.createRequest({ body: { productId: '123' } });
      const res = httpMocks.createResponse();

      dbServices.execute.mockRejectedValue(new Error('fail'));

      await productController.removeProduct(req, res);

      expect(res.statusCode).toBe(401);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.ERROR);
    });
  });

  describe('updateProduct', () => {
    it('should update product and return success message', async () => {
      const req = httpMocks.createRequest({
        body: {
          productId: 'pid123',
          name: 'Updated Name',
          investment_type: 'TypeB',
          tenure_months: 24,
          annual_yield: 6,
          risk_level: 'medium',
          min_investment: 200,
          max_investment: 2000
        }
      });
      const res = httpMocks.createResponse();

      dbServices.execute.mockResolvedValueOnce({ affectedRows: 1 });

      await productController.updateProduct(req, res);

      expect(dbServices.execute).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.PRODUCT_UPDATE_SUCCESS);
    });

    it('should return 400 if productId missing', async () => {
      const req = httpMocks.createRequest({ body: {} });
      const res = httpMocks.createResponse();

      await productController.updateProduct(req, res);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data.message).toBe("Product ID is required");
    });

    it('should return 404 if no rows affected', async () => {
      const req = httpMocks.createRequest({
        body: { productId: 'pid123', name: 'Name', investment_type: 'TypeB', tenure_months: 24, annual_yield: 6, risk_level: 'medium', min_investment: 200, max_investment: 2000 }
      });
      const res = httpMocks.createResponse();

      dbServices.execute.mockResolvedValueOnce({ affectedRows: 0 });

      await productController.updateProduct(req, res);

      expect(res.statusCode).toBe(404);
      const data = res._getJSONData();
      expect(data.message).toBe("Product not found");
    });

    it('should return 500 on error', async () => {
      const req = httpMocks.createRequest({
        body: { productId: 'pid123', name: 'Name', investment_type: 'TypeB', tenure_months: 24, annual_yield: 6, risk_level: 'medium', min_investment: 200, max_investment: 2000 }
      });
      const res = httpMocks.createResponse();

      dbServices.execute.mockRejectedValue(new Error('fail'));

      await productController.updateProduct(req, res);

      expect(res.statusCode).toBe(500);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.ERROR);
    });
  });

  describe('productListing', () => {
    it('should return products with pagination info', async () => {
      const req = httpMocks.createRequest({
        query: { page: '1', limit: '2', risk_level: 'low', investment_type: 'TypeA' }
      });
      const res = httpMocks.createResponse();

      dbServices.execute
        .mockResolvedValueOnce([{ total: 5 }])      // countQuery
        .mockResolvedValueOnce([                     // products list
          { id: 'p1', name: 'Prod1' },
          { id: 'p2', name: 'Prod2' },
        ]);

      await productController.productListing(req, res);

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();

      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
      expect(data.total).toBe(5);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.totalPages).toBe(Math.ceil(5 / 2));
    });

    it('should return 500 on error', async () => {
      const req = httpMocks.createRequest({ query: {} });
      const res = httpMocks.createResponse();

      dbServices.execute.mockRejectedValue(new Error('fail'));

      await productController.productListing(req, res);

      expect(res.statusCode).toBe(500);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.ERROR);
    });
  });

  describe('suggestProducts', () => {
    it('should return suggested products list', async () => {
      const req = httpMocks.createRequest({
        user: { risk_appetite: 'moderate' }
      });
      const res = httpMocks.createResponse();

      const dummyProducts = [
        { id: 'p1', name: 'Prod1', investment_type: 'TypeA', tenure_months: 12, annual_yield: 5, risk_level: 'low', min_investment: 100, max_investment: 1000 }
      ];

      const suggestedJsonString = JSON.stringify(dummyProducts);

      dbServices.execute.mockResolvedValueOnce(dummyProducts);
      aiServices.suggestProducts.mockResolvedValueOnce(suggestedJsonString);

      await productController.suggestProducts(req, res);

      expect(dbServices.execute).toHaveBeenCalled();
      expect(aiServices.suggestProducts).toHaveBeenCalledWith(dummyProducts, 'moderate');
      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.products).toBeDefined();
      expect(Array.isArray(data.products)).toBe(true);
    });

    it('should return 500 on error', async () => {
      const req = httpMocks.createRequest({ user: {} });
      const res = httpMocks.createResponse();

      dbServices.execute.mockRejectedValue(new Error('fail'));

      await productController.suggestProducts(req, res);

      expect(res.statusCode).toBe(500);
      const data = res._getJSONData();
      expect(data.message).toBe(CONSTANTS.RESPONSE_MESSAGES.ERROR);
    });
  });
});
