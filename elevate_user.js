const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const elevateUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/football_turf');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }
    
    user.role = 'admin';
    await user.save();
    console.log(`User ${user.email} elevated to admin!`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node elevate_user.js <email>');
  process.exit(1);
}

elevateUser(email);
