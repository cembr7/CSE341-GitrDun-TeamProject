/*module.exports = {
  testEnvironment: 'node',
  //globalSetup: './jest/globalSetup.js',          
  setupFilesAfterEnv: ['./jest/testSetup.js'],    
  testTimeout: 30000,
  clearMocks: true,
};*/

/** jest.config.js ------------------------------------------------------- */
module.exports = {
  // 1️⃣ Run tests in a pure Node environment (no JSDOM)
  testEnvironment: 'node',

  // 2️⃣ Run the in‑memory‑MongoDB helpers from each test file.
  //    We *remove* the old testSetup reference because we don’t need a
  //    global after‑env hook any more.
  //    (If you still want a placeholder, make sure it exports a function.)
  // setupFilesAfterEnv: [],   // ← either delete the line or leave it empty

  //  Tell Jest which files are tests
  //    This pattern matches any file that ends with .test.js
  testMatch: ['**/?(*.)+(test).js'],

  // 3️⃣ (Optional) If you keep tests in a dedicated folder, you can narrow it:
  // testMatch: ['<rootDir>/tests/**/*.test.js'],

  // 3️⃣ Give async operations (e.g. DB start‑up) plenty of time.
  testTimeout: 30000,

  // 4️⃣ Reset mocks between tests – nice default.
  clearMocks: true,

  // 5️⃣ (Optional) Show full stack traces for easier debugging.
  verbose: true,
};