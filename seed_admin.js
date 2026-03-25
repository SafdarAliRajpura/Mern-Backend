const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/football_turf');
        
        const email = 'admin@gmail.com';
        const userExists = await User.findOne({ email });
        if (userExists) {
            userExists.role = 'admin';
            await userExists.save();
            console.log('User was already there and is now ADMIN!');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const user = await User.create({
            first_name: 'Super',
            last_name: 'Admin',
            email: email,
            mobileNumber: 9999999999,
            password: hashedPassword,
            role: 'admin',
            isBanned: false
        });

        console.log('--- SUPER ADMIN CREATED ---');
        console.log('Email: admin@gmail.com');
        console.log('Password: admin123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
