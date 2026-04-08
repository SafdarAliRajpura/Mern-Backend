const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'user' })
            .select('first_name last_name user_profile xp skillLevel badges stats')
            .sort({ xp: -1 })
            .limit(10);
        
        res.json({
            success: true,
            data: topUsers
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
};

// Internal Helper to add XP
exports.addXP = async (userId, amount, statKey = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        user.xp += amount;
        
        if (statKey && user.stats.hasOwnProperty(statKey)) {
            user.stats[statKey] += 1;
        }

        // Calculate Skill Level based on XP
        if (user.xp > 5000) user.skillLevel = 'Legend';
        else if (user.xp > 2500) user.skillLevel = 'Elite';
        else if (user.xp > 1000) user.skillLevel = 'Pro';
        else if (user.xp > 500) user.skillLevel = 'Semi-Pro';
        else if (user.xp > 100) user.skillLevel = 'Amateur';

        await user.save();
    } catch (err) {
        console.error('XP Update Error:', err);
    }
};
