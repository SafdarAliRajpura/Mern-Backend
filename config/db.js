const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Disable buffering so queries fail fast when DB is down (allowing faster fallbacks)
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Warning: ${error.message}`);
    // Allow server to stay up for fallback data even if DB is down
  }
};

module.exports = connectDB;
