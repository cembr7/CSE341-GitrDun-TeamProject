const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('User Routes', () => {
  let userId;

  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secure123',
  };

  // Optional: clean up after all tests
  afterAll(async () => {
    await User.deleteMany({
      email: { $in: ['john@example.com', 'jane@test.com', 'newemail@example.com'] }
    });
  });

  // POST /users - create user
  it('POST /users - create user', async () => {
    const res = await request(app)
      .post('/users')                  // ← fixed: no /api
      .send(userData)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(userData.name);
    expect(res.body.email).toBe(userData.email);
    expect(res.body).not.toHaveProperty('password'); // good security check
    userId = res.body._id;
  });

  // GET /users - get all users
  it('GET /users - get all users', async () => {
    // Create a second user to ensure list isn't empty
    await request(app)
      .post('/users')
      .send({
        
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'pass123'
      });

    const res = await request(app)
      .get('/users')                   // ← fixed: no /api
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // GET /users/:id - get user by id
  it('GET /users/:id - get user by id', async () => {
    const res = await request(app)
      .get(`/users/${userId}`)         // ← fixed path
      .expect(200);

    expect(res.body.email).toBe(userData.email);
    expect(res.body.name).toBe(userData.name);
  });

  // PATCH /users/:id - update user (partial)
  it('PATCH /users/:id - update user', async () => {
    const updates = {
      name: 'John Updated',
      email: 'newemail@example.com'
    };

    const res = await request(app)
      .patch(`/users/${userId}`)       // ← changed from .put to .patch + correct path
      .send(updates)
      .expect(200);

    expect(res.body.name).toBe('John Updated');
    expect(res.body.email).toBe('newemail@example.com');
  });

  // DELETE /users/:id - delete user
  it('DELETE /users/:id - delete user', async () => {
    await request(app)
      .delete(`/users/${userId}`)      // ← fixed path
      .expect(204);                    // ← most common: 204 No Content on delete

    // Verify it's gone
    await request(app)
      .get(`/users/${userId}`)
      .expect(404);
  });
});