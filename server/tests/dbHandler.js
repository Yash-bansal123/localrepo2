const mongoose = require('mongoose');

let mongod = null;

const connect = async () => {

  if (mongoose.connection.readyState !== 0) {
    return;
  }

  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

  let uri = 'mongodb://localhost:27017/bookleaf_test';

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');

    const createMemServer = MongoMemoryServer.create();
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
    mongod = await Promise.race([createMemServer, timeout]);
    uri = mongod.getUri();
  } catch (err) {

    uri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/bookleaf_test';
  }

  await mongoose.connect(uri);
};

const closeDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {

  }
};

const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase
};
