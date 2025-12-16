// tests/user.routes.test.js ---------------------------------------------
const request = require('supertest');
const app = require('../index');               // adjust if your entry point differs
const { initMongo, closeMongo, clearDb } = require('./setup');

let server;
let agent;                                     // Supertest agent keeps session

beforeAll(async () => {
  await initMongo();                           // spin up in‑memory DB
  server = app.listen();                       // OS picks a free port
  agent = request.agent(server);
});

afterAll(async () => {
  await closeMongo();
  server && server.close();
});

/*afterEach(async () => {
  await clearDb();
});*/

/* ------------------------------------------------------------------ */
/*  Payloads – adapt if your validation schema requires more fields   */
/* ------------------------------------------------------------------ */
const userPayload = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure123',
};

describe('User routes (CRUD) – happy path', () => {
  let createdUserId;

  it('POST /api/users – creates a new user', async () => {
    const res = await agent
      .post('/api/users')          // <-- matches router mount path
      .send(userPayload)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toBe(userPayload.email);
    createdUserId = res.body._id;
  });

  it('GET /api/users – returns an array with at least one user', async () => {
    // Insert a second user so we can assert length > 1
    await agent
      .post('/api/users')
      .send({ name: 'Jane', email: 'jane@test.com', password: 'pass123' })
      .expect(201);

    const res = await agent
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/users/:id – fetches the user we created first', async () => {
    const res = await agent
      .get(`/api/users/${createdUserId}`)
      .expect(200);

    expect(res.body).toHaveProperty('_id', createdUserId);
    expect(res.body.email).toBe(userPayload.email);
  });

  it('PATCH /api/users/:id – updates the user name', async () => {
    const newName = 'John Updated';
    const res = await agent
      .patch(`/api/users/${createdUserId}`)
      .send({ name: newName })
      .expect(200);

    expect(res.body).toHaveProperty('_id', createdUserId);
    expect(res.body.name).toBe(newName);
  });

  it('DELETE /api/users/:id – removes the user', async () => {
    await agent
      .delete(`/api/users/${createdUserId}`)
      .expect(204);

    // Verify it is really gone
    await agent
      .get(`/api/users/${createdUserId}`)
      .expect(404);
  });
});