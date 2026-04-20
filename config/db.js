const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Force IPv4 to avoid IPv6/localhost resolution issues on Windows
    const connStr = process.env.MONGODB_URI.replace('localhost', '127.0.0.1');
    
    // Enable buffering so brief connection drifts don't crash requests
    mongoose.set('bufferCommands', true);
    
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000, // Wait 5 seconds before failing
    });
    
    console.log(`[DATABASE] MongoDB Protected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE] Connectivity Breach: ${error.message}`);
    // We don't exit process so the server can still serve fallback data/static files
  }
};

module.exports = connectDB;
