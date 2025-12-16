// jest.setup.js -------------------------------------------------------------
/* 1️⃣ Load test‑specific environment variables */
require('dotenv').config({ path: '.env.test' });

/* 2️⃣ Force the Passport mock (uses __mocks__/passport.js) */
jest.mock('passport');

/* 3️⃣ Optional polyfills – many Node libs expect these in a browser‑like env */
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

/* 4️⃣ Global unhandled‑rejection logger (helps CI debugging) */
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Promise Rejection:', reason);
});


/* 5️⃣ If you want fake timers for *all* tests, uncomment the line below */
// jest.useFakeTimers();

// -----------------------------------------------------------------------------
// Simplified
// ---------------------------------------------------------------------------
// jest.setup.js
/*require('dotenv').config({ path: '.env.test' }); // makes GOOGLE_CLIENT_* available
jest.mock('passport');                       // replaces the real passport module*/