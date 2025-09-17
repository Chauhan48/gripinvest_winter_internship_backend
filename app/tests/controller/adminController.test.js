const app = require('../../startup/serverStartup');
const request = require('supertest');
const dbServices = require('../../services/dbServices');
const common = require('../../utils/common');

jest.mock('../../services/dbServices', () => ({
  execute: jest.fn(),
}));

jest.mock('../../utils/common', () => ({
  comparePassword: jest.fn(),
  generateToken: jest.fn(() => 'mocked-token'),
}));

describe('Admin Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/login', () => {
    it('should login successfully with valid admin credentials', async () => {
      dbServices.execute.mockResolvedValueOnce([
        { id: 'admin-uuid', email: 'admin@example.com', password_hash: 'hashed', role: 'admin' }
      ]);
      common.comparePassword.mockResolvedValueOnce(true);

      const res = await request(app)
        .post('/admin/login')
        .send({ email: 'admin@example.com', password_hash: 'adminpass' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/success/i);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail if admin email not found', async () => {
      dbServices.execute.mockResolvedValueOnce([]);

      const res = await request(app)
        .post('/admin/login')
        .send({ email: 'notfound@example.com', password_hash: 'adminpass' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/unauthorized/i);
    });

    it('should fail if password is incorrect', async () => {
      dbServices.execute.mockResolvedValueOnce([
        { id: 'admin-uuid', email: 'admin@example.com', password_hash: 'hashed', role: 'admin' }
      ]);
      common.comparePassword.mockResolvedValueOnce(false);

      const res = await request(app)
        .post('/admin/login')
        .send({ email: 'admin@example.com', password_hash: 'wrongpass' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe('GET /admin/dashboard', () => {
    it('should return dashboard stats', async () => {
      dbServices.execute
        .mockResolvedValueOnce([{ totalUsers: 10 }])
        .mockResolvedValueOnce([{ totalProducts: 5 }])
        .mockResolvedValueOnce([{ totalInvestments: 10000 }])
        .mockResolvedValueOnce([
          { product_id: 1, name: 'Product A', totalInvestments: 5000 },
          { product_id: 2, name: 'Product B', totalInvestments: 3000 },
          { product_id: 3, name: 'Product C', totalInvestments: 2000 }
        ]);

      const res = await request(app)
        .get('/admin/dashboard');

      expect(res.statusCode).toBe(200);
      expect(res.body.totalUsers).toBeDefined();
      expect(res.body.totalProducts).toBeDefined();
      expect(res.body.totalInvestments).toBeDefined();
      expect(res.body.mostSellingProducts).toBeDefined();
      expect(Array.isArray(res.body.mostSellingProducts)).toBe(true);
    });
  });
});
