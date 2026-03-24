const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_jwt_key', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, phone, password, user_profile, role } = req.body;

    // React Native expects first_name, last_name, mobileNumber, password, user_profile
    // We parse 'name' to first_name and last_name
    let first_name = name;
    let last_name = 'User';
    if(name && name.includes(' ')) {
        const parts = name.split(' ');
        first_name = parts[0];
        last_name = parts.slice(1).join(' ');
    }

    try {
        if (!first_name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            first_name,
            last_name,
            email,
            mobileNumber: phone,
            password: hashedPassword,
            user_profile: user_profile || null,
            role: role || 'user'
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Data Inserted Successfully',
                data: {
                    _id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    user_profile: user.user_profile,
                    role: user.role,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password match
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.status(200).json({
                success: true,
                message: 'Login Successful',
                data: {
                    _id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    user_profile: user.user_profile,
                    role: user.role,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
