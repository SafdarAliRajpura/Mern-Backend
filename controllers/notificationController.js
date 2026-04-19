const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('sender', 'first_name last_name user_profile');
    
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
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

exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

// Helper function to create notification (not an exported route)
exports.createNotification = async (data) => {
    try {
        const notification = new Notification(data);
        await notification.save();

        // Send Push Notification if recipient has a token
        const recipient = await User.findById(data.recipient);
        if (recipient && recipient.pushToken && recipient.pushToken.startsWith('ExponentPushToken')) {
            try {
                await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: recipient.pushToken,
                        sound: 'default',
                        title: `TurfX: ${data.type}`,
                        body: data.message,
                        data: { link: data.link },
                    }),
                });
            } catch (pushErr) {
                console.error('Failed to send push notification:', pushErr);
            }
        }

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

        // Send Push Notifications to all admins who have tokens
        const tokens = admins.filter(a => a.pushToken && a.pushToken.startsWith('ExponentPushToken')).map(a => a.pushToken);
        if (tokens.length > 0) {
            try {
                await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tokens.map(token => ({
                        to: token,
                        sound: 'default',
                        title: `TurfX Admin: ${data.type || 'Alert'}`,
                        body: data.message,
                        data: { link: data.link },
                    }))),
                });
            } catch (pushErr) {
                console.error('Admin Push Broadcast Failure:', pushErr);
            }
        }
    } catch (e) {
        console.error('Admin Notification Broadcast Failure:', e);
    }
};
