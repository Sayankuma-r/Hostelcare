
const mongoose = require('mongoose');

let memoryServer;

const connectDB = async (uri = process.env.MONGO_URI) => {
  // Use MongoDB Memory Server only during tests
  if (!uri && process.env.NODE_ENV === 'test') {
    const { MongoMemoryServer } = require('mongodb-memory-server');

    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }

  if (!uri) {
    throw new Error(
      'MONGO_URI is not defined. Please configure your database connection.'
    );
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri);

  console.log(
    `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
  );

  return conn;
};

module.exports = connectDB;
