const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config();

const checkAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/football_turf');
    const admins = await User.find({ role: 'admin' });
    console.log('--- ADMIN USERS ---');
    admins.forEach(u => console.log(`${u.first_name} ${u.last_name} (${u.email}) - Role: ${u.role}`));
    
    if (admins.length === 0) {
        console.log('NO ADMINS FOUND! Listing all users to help you identify:');
        const all = await User.find({});
        all.forEach(u => console.log(`${u.first_name} ${u.last_name} (${u.email}) - Role: ${u.role}`));
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAdmins();
