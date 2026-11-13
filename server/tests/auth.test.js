import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
const { app } = require('../server');
const dbHandler = require('./dbHandler');
const User = require('../src/models/User');

describe('Auth API Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();

    await User.create({
      name: 'Test Author',
      email: 'testauthor@test.com',
      password: 'AuthorPassword123',
      role: 'author'
    });
  });

  it('Login success 200 - should return JWT token and user info', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testauthor@test.com',
        password: 'AuthorPassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('testauthor@test.com');
    expect(res.body.user.role).toBe('author');
  });

  it('Login wrong password 401 - should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testauthor@test.com',
        password: 'WrongPassword999'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('GET /api/auth/me without token 401 - should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Not authorized, token missing');
  });
});
