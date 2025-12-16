// ---------------------------------------------------------------
// tests/setup.js
// ---------------------------------------------------------------

/* 1️⃣ Load environment variables (optional, but handy if you use .env) */
require('dotenv').config({path: './.env.test'});
jest.mock('passport');
//jestConfig.mock(passport);

/* 2️⃣ Core deps */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/* 3️⃣ Hold a reference to the in‑memory server */
let mongoServer;

/* -----------------------------------------------------------------
   4️⃣ Initialise the in‑memory DB and connect Mongoose.
   No driver options are passed – Mongoose v6+ enables the modern
   parser/unified topology automatically.
----------------------------------------------------------------- */
async function initMongo() {
  // Create a fresh in‑memory instance for every test run
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // `mongoose.connect` returns a promise; we await it so tests start only
  // after the connection is ready.
  await mongoose.connect(uri);
}

/* -----------------------------------------------------------------
   5️⃣ Gracefully shut down the DB and Mongoose.
----------------------------------------------------------------- */
async function closeMongo() {
  // Close the Mongoose connection first
  await mongoose.disconnect();

  // Then stop the in‑memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/* -----------------------------------------------------------------
   6️⃣ Helper to wipe every collection between individual tests.
   This prevents data leaking from one test case into another.
----------------------------------------------------------------- */
async function clearDb() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/* 6️⃣ Optional global helpers */
const app = require('../index'); // adjust path if needed
global.request = require('supertest')(app);

/* 7️⃣ Custom matcher */
expect.extend({
  toBeValidObjectId(received) {
    const pass = /^[a-f\d]{24}$/i.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid ObjectId`
          : `expected ${received} to be a valid ObjectId`,
    };
  },
});

jest.setTimeout(20000); // adjust timeout if needed

/* -----------------------------------------------------------------
   7️⃣ Export the helpers so each test file can use them.
----------------------------------------------------------------- */
module.exports = {
  initMongo,
  closeMongo,
  clearDb,
};