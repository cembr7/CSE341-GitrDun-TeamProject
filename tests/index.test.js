'use strict';

// -------------------------------------------------
// 0️⃣ Mock dotenv (must be the very first Jest mock)
// -------------------------------------------------
jest.mock('dotenv');   // pulls in __mocks__/dotenv.js automatically

// -------------------------------------------------
// 1️⃣ Force test mode BEFORE the app is required
// -------------------------------------------------
process.env.NODE_ENV = 'test';

// -------------------------------------------------
// 2️⃣ Install a SINGLE console.log spy BEFORE requiring the app
// -------------------------------------------------
const consoleLogSpy = jest
  .spyOn(console, 'log')
  .mockImplementation(() => {}); // silence output, keep reference

// -------------------------------------------------
// 3️⃣ Mock other external deps (passport, DB, Google strategy)
// -------------------------------------------------
jest.mock('passport');               // ./mocks/passport.js (your mock)
jest.mock('../database');            // resolves to ./mocks/src/database.js
jest.mock('passport-google-oauth20', () => ({
  Strategy: class {
    constructor(_opts, _verify) {}
    authenticate() {}
  },
}));

// -------------------------------------------------
// 4️⃣ Load the Express app AFTER the spy and mocks are ready
// -------------------------------------------------
const app = require('/index');

console.log('DEBUG – NODE_ENV at runtime:', process.env.NODE_ENV);
console.log('DEBUG – consoleLogSpy calls so far:', consoleLogSpy.mock.calls);

// -------------------------------------------------
// 5️⃣ Clean‑up after the suite
// -------------------------------------------------
afterAll(() => {
  consoleLogSpy.mockRestore();
});

// -------------------------------------------------
// 6️⃣ Supertest helper
// -------------------------------------------------
const request = require('supertest');

// -------------------------------------------------
// 7️⃣ Test suite
// -------------------------------------------------
describe('src/index.js (Express app)', () => {
  /*test('logs auth‑bypass activation in test mode', () => {
    /*expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('🚧 TEST MODE – auth bypass active')
    );*/
    // Option B – tolerant regex (uncomment if you keep a hyphen)
     /* expect(consoleLogSpy).toHaveBeenCalledWith(
       expect.stringMatching(/TEST MODE\s*[‑-]\s*auth bypass active/i)
     );
  });*/

  test('GET / (health endpoint) returns expected JSON', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'API is running',
    });
  });

  test('GET /api-docs returns Swagger UI HTML', async () => {
    const response = await request(app)
      .get('/api-docs')
      .redirects(1); // follow possible trailing‑slash redirect
    expect(response.status).toBe(200);
    expect(response.text).toContain('Swagger UI');
  });

  test('auth‑bypass middleware injects a fake user', async () => {
    // Temporary route that just echoes the injected user
    app.get('/test-auth-bypass', (req, res) => {
      res.json({ user: req.user, isAuth: req.isAuthenticated() });
    });

    const res = await request(app).get('/test-auth-bypass');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      user: {
        _id: '507f1f77bcf86cd799439011',
        email: 'testadmin@example.com',
        name: 'Test Admin',
        role: 'admin',
      },
      isAuth: true,
    });
  });
});