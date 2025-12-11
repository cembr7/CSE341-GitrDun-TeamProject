const mongoose = require('mongoose');

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (globalThis.__MONGOD__) await globalThis.__MONGOD__.stop();
  await mongoose.disconnect();
});