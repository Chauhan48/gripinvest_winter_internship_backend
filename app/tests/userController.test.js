
const app = require('../startup/serverStartup');
const request = require('supertest');
const dbServices = require('../services/dbServices');

jest.mock('../services/dbServices');

describe('User Controller Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should register a new user successfully', async () => {
      dbServices.find.mockResolvedValueOnce([]);
      dbServices.addRow.mockResolvedValueOnce();

      const res = await request(app)
        .post('/user/signup')   // Include the /user prefix
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password_hash: 'StrongPass123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/success/i);
    });

    it('should fail if email already exists', async () => {
      dbServices.find.mockResolvedValueOnce([{ id: 'some-uuid' }]);

      const res = await request(app)
        .post('/user/signup')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password_hash: 'StrongPass123!'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toMatch(/exists/i);
    });
  });

  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      dbServices.find.mockResolvedValueOnce([{
        id: 'user-uuid',
        email: 'john@example.com',
        password_hash: await require('../utils/common').hashPassword('StrongPass123!')
      }]);

      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'john@example.com',
          password_hash: 'StrongPass123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/success/i);
    });

    it('should fail login with invalid credentials', async () => {
      dbServices.find.mockResolvedValueOnce([]);

      const res = await request(app)
        .post('/user/login')
        .send({
          email: 'unknown@example.com',
          password_hash: 'wrongpass'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe('POST /forgotPassword', () => {
    it('should send OTP email if user exists', async () => {
      dbServices.find.mockResolvedValueOnce([{
        id: 'user-uuid',
        email: 'john@example.com',
        first_name: 'John'
      }]);
      dbServices.addRow.mockResolvedValueOnce();

      const res = await request(app)
        .post('/user/forgotPassword')
        .send({ email: 'john@example.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/success/i);
      expect(res.body.token).toBeDefined();
    });

    it('should return error if email not found', async () => {
      dbServices.find.mockResolvedValueOnce([]);

      const res = await request(app)
        .post('/user/forgotPassword')
        .send({ email: 'unknown@example.com' });

      expect(res.statusCode).toBe(401);
    });
  });
});
