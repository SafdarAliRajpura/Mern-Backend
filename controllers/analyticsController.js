const Booking = require('../models/Booking');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Tournament = require('../models/Tournament');

// @desc    Get dashboard metrics for Partner
// @route   GET /api/analytics/dashboard
// @access  Private (Partner/Admin)
const getDashboardMetrics = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        let bookingsQuery = {};
        let upcomingBookings = [];
        let totalRevenue = 0;

        // If Partner, restrict to their specific venues
        if (req.user.role === 'partner') {
            const myVenues = await Venue.find({ owner: req.user.id });
            const myVenueNames = myVenues.map(v => v.name);
            bookingsQuery = { turfName: { $in: myVenueNames } };
            
            upcomingBookings = await Booking.find({ 
                turfName: { $in: myVenueNames },
                status: { $in: ['Confirmed', 'Pending'] }
            }).sort({ createdAt: -1 }).limit(5);

            // Calculate revenue in Node.js to avoid aggregate casting errors
            const confirmedBookings = await Booking.find({ turfName: { $in: myVenueNames }, status: 'Confirmed' });
            totalRevenue = confirmedBookings.reduce((sum, b) => {
                const num = parseInt(b.price ? b.price.toString().replace(/[^0-9]/g, '') : '0', 10);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);

        } else if (req.user.role === 'admin') {
            // Admin sees all
            upcomingBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);

            const confirmedBookings = await Booking.find({ status: 'Confirmed' });
            totalRevenue = confirmedBookings.reduce((sum, b) => {
                const num = parseInt(b.price ? b.price.toString().replace(/[^0-9]/g, '') : '0', 10);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);
        } else {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const totalBookings = await Booking.countDocuments(bookingsQuery);

        // Active players (unique users who have booked)
        let activePlayers = 0;
        try {
            activePlayers = (await Booking.distinct('userId', bookingsQuery)).length;
            if(activePlayers === 0) {
                // fallback to named unique players if no IDs linked
                activePlayers = (await Booking.distinct('user', bookingsQuery)).length;
            }
        } catch(e) { console.error(e); }

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                totalRevenue: Math.round(totalRevenue),
                activePlayers,
                recentBookings: upcomingBookings
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }

};

// @desc    Get public platform statistics
// @route   GET /api/analytics/platform-stats
// @access  Public
const getPlatformStats = async (req, res) => {
    try {
        const [totalUsers, totalVenues, totalTournaments, topVenue, recentUsers] = await Promise.all([
            User.countDocuments({}),
            Venue.countDocuments({ status: { $regex: /^active$/i } }),
            Tournament.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } }),
            Venue.findOne({ status: { $regex: /^active$/i } }).sort({ rating: -1 }),
            User.find({ user_profile: { $ne: null } }).sort({ createdAt: -1 }).limit(4).select('user_profile')
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: totalUsers,
                venues: totalVenues,
                tournaments: totalTournaments,
                featuredVenue: topVenue,
                recentAvatars: recentUsers.map(u => u.user_profile)
            }
        });
    } catch (error) {
        console.error('Platform Stats Error:', error);
        res.status(500).json({ success: false, message: error.message, stack: error.stack });
    }
};

module.exports = {
    getDashboardMetrics,
    getPlatformStats
};
