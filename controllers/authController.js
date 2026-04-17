const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendPasswordChangeAlert } = require('../utils/sendEmail');
const { notifyAdmins } = require('./notificationController');
const Booking = require('../models/Booking');
const Discussion = require('../models/Discussion');
const TournamentRegistration = require('../models/TournamentRegistration');

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
        if (!first_name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Please add all required profile fields' });
        }
        
        // Use password requirement for non-partners or if provided
        if (role !== 'partner' && !password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password (only if provided - standard for users, omitted for partners now)
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Create user
        const user = await User.create({
            first_name,
            last_name,
            email,
            mobileNumber: phone,
            password: hashedPassword || null, // Password is optional for pending partners
            user_profile: user_profile || null,
            role: role || 'user',
            isApproved: role === 'partner' ? false : true // Partners must be approved
        });

        if (user) {
            // Send Welcome Email (only for regular users)
            if (user.role === 'user') {
                sendWelcomeEmail({
                    email: user.email,
                    name: user.first_name || 'Champion'
                });

                // Notify Admins about new Player
                notifyAdmins({
                    type: 'SYSTEM',
                    message: `New Athlete Joined: ${user.first_name} ${user.last_name} (${user.email})`,
                    link: '/admin/users'
                });
            } else if (user.role === 'partner') {
                // Notify Admins about new Partner Registration
                notifyAdmins({
                    type: 'SYSTEM',
                    message: `New Partner Application: ${user.first_name} ${user.last_name} is awaiting review.`,
                    link: '/admin/partners'
                });
            }

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
                    xp: user.xp,
                    skillLevel: user.skillLevel,
                    stats: user.stats,
                    badges: user.badges,
                    isOnboarded: user.isOnboarded,
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

        // Check if Approved (for Partners)
        if (user.role === 'partner' && !user.isApproved) {
            return res.status(403).json({ success: false, message: 'Your application is currently PENDING review by the Super Admin.' });
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
                    xp: user.xp,
                    skillLevel: user.skillLevel,
                    stats: user.stats,
                    badges: user.badges,
                    isOnboarded: user.isOnboarded,
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

// @desc    Get current user profile with dynamic rank
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        // Calculate global rank based on XP (only comparing with other 'user' role members)
        const rank = await User.countDocuments({ 
            role: 'user', 
            xp: { $gt: req.user.xp || 0 } 
        }) + 1;

        // Calculate dynamic stats
        const [totalBookings, discussionsCreated, tournamentEntries] = await Promise.all([
            Booking.countDocuments({ userId: req.user.id, status: { $ne: 'Cancelled' } }),
            Discussion.countDocuments({ author: req.user.id }),
            TournamentRegistration.countDocuments({ userId: req.user.id })
        ]);

        // Spread the user doc and append the calculated rank and dynamic stats
        const userData = {
            ...req.user._doc,
            rank,
            stats: {
                ...req.user.stats,
                totalBookings,
                discussionsCreated,
                tournamentEntries
            }
        };

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('GetMe Rank Calculation Error:', error);
        res.status(200).json({
            success: true,
            data: req.user
        });
    }
};

// @desc    Onboard Partner (Update details and change state)
// @route   PUT /api/auth/onboard
// @access  Private
const onboardPartner = async (req, res) => {
    try {
        const { 
            businessName, supportEmail, supportPhone, 
            gstNumber, brandLogo, 
            accountHolderName, accountNumber, ifscCode, upiId 
        } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.businessName = businessName;
        user.supportEmail = supportEmail;
        user.supportPhone = supportPhone;
        user.gstNumber = gstNumber;
        user.brandLogo = brandLogo;
        user.accountHolderName = accountHolderName;
        user.accountNumber = accountNumber;
        user.ifscCode = ifscCode;
        user.upiId = upiId;
        user.isOnboarded = true;
        
        await user.save();
        
        // Notify Admins about partner activation
        notifyAdmins({
            type: 'SYSTEM',
            message: `Brand Activated: ${user.businessName} has completed onboarding protocols.`,
            link: '/admin/partners'
        });
        
        res.status(200).json({
            success: true,
            message: 'Onboarding completed',
            data: {
                _id: user.id,
                first_name: user.first_name,
                isOnboarded: user.isOnboarded,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update partner profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { 
            businessName, first_name, last_name, email, 
            mobileNumber, websiteLink, user_profile,
            bio, primaryRole, favoriteSports, socialLinks
        } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Update fields if provided
        if (businessName !== undefined) user.businessName = businessName;
        if (first_name !== undefined) user.first_name = first_name;
        if (last_name !== undefined) user.last_name = last_name;
        if (email !== undefined) user.email = email;
        if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
        if (websiteLink !== undefined) user.websiteLink = websiteLink;
        if (user_profile !== undefined) user.user_profile = user_profile;
        if (bio !== undefined) user.bio = bio;
        if (primaryRole !== undefined) user.primaryRole = primaryRole;
        if (favoriteSports !== undefined) user.favoriteSports = favoriteSports;
        if (socialLinks !== undefined) user.socialLinks = socialLinks;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                user_profile: user.user_profile,
                businessName: user.businessName,
                websiteLink: user.websiteLink,
                role: user.role,
                xp: user.xp,
                skillLevel: user.skillLevel,
                bio: user.bio,
                primaryRole: user.primaryRole,
                favoriteSports: user.favoriteSports,
                socialLinks: user.socialLinks,
                stats: {
                    ...user.stats,
                    totalBookings: await Booking.countDocuments({ userId: user.id, status: { $ne: 'Cancelled' } }),
                    discussionsCreated: await Discussion.countDocuments({ author: user.id }),
                    tournamentEntries: await TournamentRegistration.countDocuments({ userId: user.id })
                },
                badges: user.badges,
                isOnboarded: user.isOnboarded,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // If user already has a password, verify current password
        if (user.password) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Incorrect current password' });
            }
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        
        // Send alert email asynchronously
        try {
            sendPasswordChangeAlert({
                email: user.email,
                name: user.first_name || 'User'
            });
        } catch (emailErr) {
            console.error('Error sending password change alert:', emailErr);
        }
        
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    onboardPartner,
    updateProfile,
    changePassword,
};
