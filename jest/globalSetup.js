/*const { MongoMemoryServer } = require('mongodb-memory-server-core');

module.exports = async () => {
  const instance = await MongoMemoryServer.create({
    binary: {
      version: '7.0.15',                    
      downloadDir: './.mongodb-binaries',
    },
    instance: {
      
    },
  });

  // This is all you need — .create() already starts the server
  process.env.MONGO_URI = instance.getUri();
  globalThis.__MONGOD__ = instance;

  // Optional but recommended: ensures the server is fully ready
  await instance.ensureInstance();

  console.log('MongoMemoryServer ready at', instance.getUri());
};*/