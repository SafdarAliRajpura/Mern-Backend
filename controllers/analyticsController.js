const Booking = require('../models/Booking');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Tournament = require('../models/Tournament');

// @desc    Get dashboard metrics for Partner
// @route   GET /api/analytics/dashboard
// @access  Private (Partner/Admin)
// @desc    Get dashboard metrics for Partner/Admin
// @route   GET /api/analytics/dashboard
// @access  Private (Partner/Admin)
const getDashboardMetrics = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        let bookingsQuery = {};
        if (req.user.role === 'partner') {
            const myVenues = await Venue.find({ owner: req.user.id });
            const myVenueNames = myVenues.map(v => v.name);
            bookingsQuery = { turfName: { $in: myVenueNames } };
        }

        // 1. Current Period Data (Last 30 Days)
        const currentBookings = await Booking.find({ 
            ...bookingsQuery,
            createdAt: { $gte: thirtyDaysAgo }
        });

        const currentRevenue = currentBookings
            .filter(b => b.status === 'Confirmed')
            .reduce((sum, b) => {
                const num = parseInt(b.price ? b.price.toString().replace(/[^0-9]/g, '') : '0', 10);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);

        const currentPlayers = new Set(currentBookings.map(b => b.userId?.toString() || b.user)).size;

        // 2. Previous Period Data (30-60 Days Ago)
        const prevBookings = await Booking.find({ 
            ...bookingsQuery,
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        });

        const prevRevenue = prevBookings
            .filter(b => b.status === 'Confirmed')
            .reduce((sum, b) => {
                const num = parseInt(b.price ? b.price.toString().replace(/[^0-9]/g, '') : '0', 10);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);

        const prevPlayers = new Set(prevBookings.map(b => b.userId?.toString() || b.user)).size;

        // 3. Trends Calculation
        const calcTrend = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
        };

        const trends = {
            revenue: calcTrend(currentRevenue, prevRevenue),
            bookings: calcTrend(currentBookings.length, prevBookings.length),
            players: calcTrend(currentPlayers, prevPlayers)
        };

        // 4. Totals (All time)
        const totalBookings = await Booking.countDocuments(bookingsQuery);
        // Case-insensitive check for 'confirmed'
        const allConfirmed = await Booking.find({ 
            ...bookingsQuery, 
            status: { $regex: /^confirmed$/i } 
        });
        
        const totalRevenue = allConfirmed.reduce((sum, b) => {
            const num = parseInt(b.price ? b.price.toString().replace(/[^0-9]/g, '') : '0', 10);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
        
        // Total Registered Users
        const totalRegisteredUsers = await User.countDocuments({});

        // Active players (Unique participants in bookings)
        const distinctUserIds = await Booking.distinct('userId', bookingsQuery);
        const distinctUserNames = await Booking.distinct('user', bookingsQuery);
        // Merge them - names are fallback for Guest bookings
        const activePlayersCount = new Set([
            ...distinctUserIds.map(id => id.toString()),
            ...distinctUserNames
        ]).size;

        // 5. Monthly Revenue for Chart (Last 12 Months)
        const chartData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            const monthBookings = await Booking.find({
                ...bookingsQuery,
                status: { $regex: /^confirmed$/i },
                createdAt: { $gte: start, $lte: end }
            });

            const monthRev = monthBookings.reduce((sum, b) => {
                const num = parseInt(b.price ? b.price.toString().replace(/[^0-9]/g, '') : '0', 10);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);

            chartData.push({
                month: start.toLocaleString('default', { month: 'short' }),
                revenue: monthRev
            });
        }

        // 6. Recent Bookings for list
        const recentBookings = await Booking.find(bookingsQuery)
            .populate('userId', 'first_name last_name user_profile')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                totalRevenue: Math.round(totalRevenue),
                activePlayers: activePlayersCount,
                totalUsers: totalRegisteredUsers,
                trends,
                chartData,
                recentBookings,
                systemStatus: 'Optimal'
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
            User.find({ user_profile: { $ne: null } }).sort({ createdAt: -1 }).limit(10).select('user_profile')
        ]);

        let featuredAvatars = [];
        let featuredCount = 0;

        if (topVenue) {
            // Find real users who booked this turf
            const recentBookings = await Booking.find({ turfName: topVenue.name })
                .sort({ createdAt: -1 })
                .limit(30)
                .populate('userId', 'user_profile');
            
            // Extract unique avatars
            featuredAvatars = Array.from(new Set(
                recentBookings.map(b => b.userId?.user_profile).filter(p => !!p)
            )).slice(0, 3);

            // Fallback to recent users if not enough bookings
            if (featuredAvatars.length < 3) {
                const globalAvatars = recentUsers.map(u => u.user_profile).filter(p => !featuredAvatars.includes(p));
                featuredAvatars = [...featuredAvatars, ...globalAvatars].slice(0, 3);
            }

            featuredCount = await Booking.countDocuments({ turfName: topVenue.name });
        }

        res.status(200).json({
            success: true,
            data: {
                users: totalUsers,
                venues: totalVenues,
                tournaments: totalTournaments,
                featuredVenue: topVenue,
                recentAvatars: recentUsers.map(u => u.user_profile),
                featuredVenueAvatars: featuredAvatars,
                featuredVenueBookingCount: featuredCount
            }
        });
    } catch (error) {
        console.error('Platform Stats Error:', error);
        
        // Return elite fallbacks if DB is down
        const fallbacks = {
            users: 2400,
            venues: 45,
            tournaments: 12,
            featuredVenue: {
                name: "Elite Sports Arena",
                location: "Greater Kailash, Delhi",
                rating: 5.0,
                image: null
            },
            recentAvatars: [],
            featuredVenueAvatars: [],
            featuredVenueBookingCount: 25,
            isFallback: true
        };

        res.status(200).json({ success: true, data: fallbacks });
    }
};

module.exports = {
    getDashboardMetrics,
    getPlatformStats
};
