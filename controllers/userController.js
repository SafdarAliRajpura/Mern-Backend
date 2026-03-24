const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
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
    
    // Admin cannot ban other admins easily, basic check (optional but good practice)
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an admin' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User successfully ${user.isBanned ? 'banned' : 'unbanned'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getUsers,
  toggleUserBan
};
