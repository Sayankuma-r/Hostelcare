const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error('MONGO_URI is not defined. Copy .env.example to .env and set it.');
  }
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
