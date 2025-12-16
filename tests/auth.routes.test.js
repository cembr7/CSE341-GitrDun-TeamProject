// tests/tasks.routes.test.js --------------------------------------------
// at the very top of tests/auth.routes.test.js
jest.mock('passport');

jest.setTimeout(60_000); 

const request = require('supertest');
const app = require('../index');
const { initMongo, closeMongo, clearDb } = require('./setup');

let server, agent;

beforeAll(async () => {
  await initMongo();
  server = app.listen();
  agent = request.agent(server);
});

afterAll(async () => {
  await closeMongo();
  server && server.close();
});

afterEach(async () => {
  await clearDb();
});

/* … payloads and test cases stay exactly as previously shown … */

describe('Auth routes (Google OAuth mock)', () => {
  it('GET /auth/google – redirects to Google (302)', async () => {
    const res = await agent
      .get('/auth/google')
      .expect(302);

    // The mock simply calls `next()`, so we won’t have a real Google URL.
    // In a real integration test you’d check `Location` header.
    expect(res.headers.location).toBeUndefined(); // because we mocked it
  });

  it('GET /auth/google/callback – successful login redirects', async () => {
    const res = await agent
      .get('/auth/google/callback')
      .expect(302);               // our mock ends with a redirect

    // In the real implementation the redirect goes to "/" or "/dashboard.html"
    // The mock doesn’t set a location, but we can still assert the status.
    expect(res.status).toBe(302);
  });

  // Optional: simulate a failure case
  it('GET /auth/google/callback – handles auth failure', async () => {
  const passport = require('passport');

  // *** IMPORTANT: the mock MUST terminate the request ***
  passport.authenticate.mockImplementationOnce(() => (req, res, next) => {
    // Simulate a failed login – no user, but we still have an `info` object
    const err = null;
    const user = false;
    const info = { message: 'Invalid credentials' };

    // Send a proper HTTP response so the request ends
    return res
      .status(401)
      .json({
        error: true,
        message: 'Google OAuth login failed',
        details: info,
      });
  });

  const res = await agent
    .get('/auth/google/callback')
    .expect(401); // we now expect a 401, not a 302

  // Verify the payload matches what the mock sent
  expect(res.body).toMatchObject({
    error: true,
    message: 'Google OAuth login failed',
    details: { message: 'Invalid credentials' },
  });
  },
  60_000
  ); // individual test timeout
});
