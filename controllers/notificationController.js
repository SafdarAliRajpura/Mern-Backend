const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('sender', 'first_name last_name user_profile');
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

// Helper function to create notification (not an exported route)
exports.createNotification = async (data) => {
    try {
        const notification = new Notification(data);
        await notification.save();
        return notification;
    } catch (e) {
        console.error('Notification Creation Error:', e);
    }
};

// Global broadcast to all Super Admins
exports.notifyAdmins = async (data) => {
    try {
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            ...data,
            recipient: admin._id
        }));
        await Notification.insertMany(notifications);
    } catch (e) {
        console.error('Admin Notification Broadcast Failure:', e);
    }
};
