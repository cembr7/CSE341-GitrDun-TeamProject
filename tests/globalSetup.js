const { MongoMemoryServer } = require('mongodb-memory-server-core');

module.exports = async () => {
  const instance = await MongoMemoryServer.create({
    binary: {
      version: '6.0.16',        // super stable + fast download on Apple Silicon
      downloadDir: './.mongodb-binaries'
    },
    instance: {
      storageEngine: 'ephemeralForTest'
    },
    autoStart: false
  });
  process.env.MONGODB_URI = instance.getUri();
  globalThis.__MONGOD__ = instance;
};