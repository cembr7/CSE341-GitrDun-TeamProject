/*const mongoose = require('mongoose');

beforeEach(async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((c) => c.deleteMany({}))
  );
});

afterAll(async () => {
  await mongoose.connection.close();
  if (globalThis.__MONGOD__) await globalThis.__MONGOD__.stop();
});*/