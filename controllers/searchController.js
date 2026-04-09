const Venue = require('../models/Venue');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

// @route   GET /api/search
// @desc    Global search for venues, tournaments and players
// @access  Public
exports.globalSearch = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const regex = new RegExp(query, 'i');

        // Search in parallels
        const [venues, tournaments, users] = await Promise.all([
            Venue.find({ 
                $or: [
                    { name: regex },
                    { location: regex },
                    { sports: { $in: [regex] } }
                ],
                status: { $regex: /^active$/i }
            }).limit(5).select('name location image price sports rating'),

            Tournament.find({
                $or: [
                    { name: regex },
                    { location: regex },
                    { category: regex }
                ]
            }).limit(5).select('name location date category prizePool status'),

            User.find({
                $or: [
                    { first_name: regex },
                    { last_name: regex }
                ],
                role: 'user'
            }).limit(5).select('first_name last_name user_profile xp skillLevel')
        ]);

        const results = [
            ...venues.map(v => ({ ...v._doc, type: 'Venue' })),
            ...tournaments.map(t => ({ ...t._doc, type: 'Tournament' })),
            ...users.map(u => ({ ...u._doc, type: 'Player' }))
        ];

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Global Search Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
