import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
const { app } = require('../server');
const dbHandler = require('./dbHandler');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');

describe('Ticket API & Security Integration Tests', () => {
  let author1Token;
  let author2Token;
  let adminToken;
  let author1User;
  let author2User;
  let adminUser;
  let author1Ticket;

  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();

    author1User = await User.create({
      name: 'Author One',
      email: 'author1@test.com',
      password: 'AuthorPassword123',
      role: 'author'
    });

    author2User = await User.create({
      name: 'Author Two',
      email: 'author2@test.com',
      password: 'AuthorPassword123',
      role: 'author'
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@bookleaf.com',
      password: 'AdminPassword123',
      role: 'admin'
    });

    const resA1 = await request(app).post('/api/auth/login').send({
      email: 'author1@test.com',
      password: 'AuthorPassword123'
    });
    author1Token = resA1.body.token;

    const resA2 = await request(app).post('/api/auth/login').send({
      email: 'author2@test.com',
      password: 'AuthorPassword123'
    });
    author2Token = resA2.body.token;

    const resAdm = await request(app).post('/api/auth/login').send({
      email: 'admin@bookleaf.com',
      password: 'AdminPassword123'
    });
    adminToken = resAdm.body.token;

    author1Ticket = await Ticket.create({
      author: author1User._id,
      subject: 'Royalty check for quarter 2',
      description: 'I would like to inquire about my royalty payout status for the second quarter.',
      category: 'Royalty & Payments',
      priority: 'High',
      status: 'Open',
      internalNotes: [
        {
          note: 'Confidential admin note: Author account is being audited.',
          addedBy: adminUser._id,
          createdAt: new Date()
        }
      ]
    });
  });

  it('POST /api/tickets without token 401 - should reject request without auth', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        subject: 'Valid Subject Line',
        description: 'This is a valid ticket description that is long enough.'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/tickets with invalid subject 400 - should reject subjects shorter than 5 chars', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${author1Token}`)
      .send({
        subject: 'Hi',
        description: 'This is a description that is long enough to meet the 20 char minimum requirement.'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some(e => e.path === 'subject')).toBe(true);
  });

  it('Author cannot access other author\'s ticket 403 - should block unauthorized access', async () => {

    const res = await request(app)
      .get(`/api/tickets/${author1Ticket._id}`)
      .set('Authorization', `Bearer ${author2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Not authorized to view this ticket');
  });

  it('Admin cannot be accessed by author 403 - should block non-admin from admin queue', async () => {

    const res = await request(app)
      .get('/api/admin/tickets')
      .set('Authorization', `Bearer ${author1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Admin access only');
  });

  it('Internal notes not visible to author - author response must not contain internalNotes', async () => {

    const resAuthor = await request(app)
      .get(`/api/tickets/${author1Ticket._id}`)
      .set('Authorization', `Bearer ${author1Token}`);

    expect(resAuthor.status).toBe(200);
    expect(resAuthor.body.success).toBe(true);

    expect(resAuthor.body.ticket.internalNotes).toBeUndefined();

    const resAdmin = await request(app)
      .get(`/api/admin/tickets/${author1Ticket._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resAdmin.status).toBe(200);
    expect(resAdmin.body.ticket.internalNotes).toBeDefined();
    expect(resAdmin.body.ticket.internalNotes.length).toBe(1);
    expect(resAdmin.body.ticket.internalNotes[0].note).toContain('Confidential admin note');
  });
});
