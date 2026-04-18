const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { 
  sendBanEmail, 
  sendUnbanEmail, 
  sendPartnerApprovalEmail, 
  sendPartnerRejectionEmail 
} = require('../utils/sendEmail');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle user ban status
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an admin' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    const emailOptions = {
      email: user.email,
      name: user.first_name || 'Champion'
    };

    if (user.isBanned) {
      sendBanEmail(emailOptions);
    } else {
      sendUnbanEmail(emailOptions);
    }

    res.status(200).json({
      success: true,
      message: `User successfully ${user.isBanned ? 'banned' : 'unbanned'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Approve a pending partner
// @route   PUT /api/users/:id/approve-partner
// @access  Private/Admin
const approvePartner = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'partner') {
            return res.status(404).json({ success: false, message: 'Partner application not found' });
        }

        if (user.isApproved) {
            return res.status(400).json({ success: false, message: 'Partner already approved' });
        }

        // Generate Custom Random Password
        // Logic: turfNamePrefix + first_name + phoneLast4 + RandomChar
        const turfPart = user.first_name.split('|')[0].trim().substring(0, 3).toUpperCase() || 'ARENA';
        const namePart = (user.first_name.split('|')[1] || user.last_name).trim().substring(0, 3).toLowerCase();
        const phonePart = user.mobileNumber.toString().slice(-4);
        const randomChar = Math.random().toString(36).substring(2, 4);
        const generatedPassword = `${turfPart}_${namePart}${phonePart}${randomChar}`;

        // Hash and Save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(generatedPassword, salt);
        user.isApproved = true;
        await user.save();

        // Send Premium Approval Email
        sendPartnerApprovalEmail({
            email: user.email,
            name: (user.first_name.split('|')[1] || '').trim() || 'Partner',
            turfName: (user.first_name.split('|')[0] || '').trim() || 'Stadium',
            password: generatedPassword
        });

        res.status(200).json({
            success: true,
            message: 'Partner approved and credentials dispatched.',
            data: user
        });
    } catch (error) {
        console.error("Partner Approval Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reject a pending partner
// @route   DELETE /api/users/:id/reject-partner
// @access  Private/Admin
const rejectPartner = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'partner') {
            return res.status(404).json({ success: false, message: 'Partner application not found' });
        }

        // Send Premium Rejection Email
        sendPartnerRejectionEmail({
            email: user.email,
            name: (user.first_name.split('|')[1] || '').trim() || 'Partner',
            turfName: (user.first_name.split('|')[0] || '').trim() || 'Stadium'
        });

        // Delete the entry
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Partner application rejected and entry deleted.'
        });
    } catch (error) {
        console.error("Partner Rejection Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add XP and potentially level up a user
// @access  Internal Helper
const addUserXP = async (userId, amount, eventType = '') => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        user.xp = (user.xp || 0) + amount;

        // Stat mapping based on event
        if (eventType === 'booking') user.stats.totalBookings += 1;
        if (eventType === 'post') user.stats.discussionsCreated += 1;
        if (eventType === 'comment') user.stats.commentsPosted += 1;

        // Level Logic
        // 0 - 100: Rookie
        // 101 - 500: Amateur
        // 501 - 1500: Semi-Pro
        // 1501 - 3000: Pro
        // 3001 - 6000: Elite
        // 6001+: Legend
        const xp = user.xp;
        let newLevel = 'Rookie';
        if (xp > 6000) newLevel = 'Legend';
        else if (xp > 3000) newLevel = 'Elite';
        else if (xp > 1500) newLevel = 'Pro';
        else if (xp > 500) newLevel = 'Semi-Pro';
        else if (xp > 100) newLevel = 'Amateur';

        user.skillLevel = newLevel;
        await user.save();
        return user;
    } catch (error) {
        console.error('Gamification Error:', error);
        return null;
    }
};

module.exports = {
  getUsers,
  toggleUserBan,
  approvePartner,
  rejectPartner,
  addUserXP
};
