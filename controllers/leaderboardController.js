const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'user' })
            .select('first_name last_name user_profile xp skillLevel primaryRole badges stats')
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

        user.xp = (user.xp || 0) + amount;
        
        // Dynamic Stat Increment
        if (statKey && user.stats.hasOwnProperty(statKey)) {
            user.stats[statKey] += 1;
        }

        // Tier Thresholds
        // Legend: 5001+
        // Elite: 2501 - 5000
        // Pro: 1001 - 2500
        // Semi-Pro: 501 - 1000
        // Amateur: 101 - 500
        // Rookie: 0 - 100
        const xp = user.xp;
        let newLevel = 'Rookie';
        if (xp > 5000) newLevel = 'Legend';
        else if (xp > 2500) newLevel = 'Elite';
        else if (xp > 1000) newLevel = 'Pro';
        else if (xp > 500) newLevel = 'Semi-Pro';
        else if (xp > 100) newLevel = 'Amateur';

        user.skillLevel = newLevel;
        await user.save();
    } catch (err) {
        console.error('XP/Skill Error:', err);
    }
};
