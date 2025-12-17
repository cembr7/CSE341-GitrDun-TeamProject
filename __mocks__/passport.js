// __mocks__/passport.js
// ---------------------------------------------------------------
// Minimal mock that satisfies:
//   * passport.use
//   * passport.initialize / passport.session (middleware)
//   * passport.authenticate (default = 302, overridable per‑test)
//   * serializeUser / deserializeUser (no‑ops, required by your config)
//   * Strategy placeholder (so `new GoogleStrategy(...)` doesn't explode)
// ---------------------------------------------------------------

const mockStrategy = jest.fn(); // placeholder for `new GoogleStrategy(...)`

const passport = {
  /* -----------------------------------------------------------------
     Core API used by your app (called in passport-config.js)
     ----------------------------------------------------------------- */
  use: jest.fn(),

  // The real app registers these callbacks; we just store them so they exist.
  serializeUser: jest.fn((fn) => {
    // keep a reference in case a test wants to call it later
    passport._serializeUser = fn;
  }),
  deserializeUser: jest.fn((fn) => {
    passport._deserializeUser = fn;
  }),

  /* -----------------------------------------------------------------
     Middleware that Express expects
     ----------------------------------------------------------------- */
  initialize: () => (req, res, next) => next(),
  session: () => (req, res, next) => next(),

  /* -----------------------------------------------------------------
     Authentication – default (happy‑path) implementation
     ----------------------------------------------------------------- */
  // The test suite expects a 302 response for the normal `/auth/google` flow.
  // `res.sendStatus(302)` sends exactly that *without* a Location header.
  authenticate: jest.fn(() => (req, res, next) => {
    res.sendStatus(302); // ← 302 OK for the “redirect” test
  }),

  /* -----------------------------------------------------------------
     Strategy placeholder – required only so `new GoogleStrategy(...)`
     doesn’t throw when the config file is evaluated.
     ----------------------------------------------------------------- */
  Strategy: mockStrategy,
};

module.exports = passport;