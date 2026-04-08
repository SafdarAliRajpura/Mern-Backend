const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../utils/sendEmail');
const { createNotification } = require('./notificationController');
const { addXP } = require('./leaderboardController');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public (for now)
exports.createBooking = async (req, res) => {
    try {
        // Link booking to the authenticated user if available
        if (req.user) {
            req.body.userId = req.user.id;
            req.body.user = `${req.user.first_name || 'Champion'} ${req.user.last_name || ''}`.trim();
        }
        // Check for double bookings (Prevent overlapping slots)
        const { turfName, date, timeSlot } = req.body;
        if (turfName && date && timeSlot) {
            const conflict = await Booking.findOne({
                turfName,
                date,
                timeSlot,
                status: { $in: ['Confirmed', 'Pending'] } // Do not block if Cancelled/Rejected
            });

            if (conflict) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Slot unavailable! ${turfName} is already booked on ${date} at ${timeSlot}.` 
                });
            }
        }

        const booking = await Booking.create(req.body);
        
        // Send email confirmation
        try {
            const email = (req.user && req.user.email) || req.body.email;
            if (email) {
                sendBookingConfirmation({
                    email: email,
                    name: (req.user && req.user.first_name) || req.body.user || 'Champion',
                    venueName: booking.turfName,
                    date: booking.date,
                    timeSlot: booking.timeSlot
                });
            }
        } catch (emailErr) {
            console.error('Email confirmation error:', emailErr);
        }

        // Trigger System Notification
        if (req.user) {
            await createNotification({
                recipient: req.user.id,
                type: 'BOOKING',
                message: `Booking created for ${booking.turfName} on ${booking.date}`,
                link: '/bookings'
            });
        }

        // Reward for booking
        if (req.user) {
            await addXP(req.user.id, 50, 'totalBookings');
        }

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   GET /api/bookings/public
// @desc    Get all bookings for a specific venue for slot UI blocking
// @access  Public
exports.getPublicBookings = async (req, res) => {
    try {
        const { turfName, date } = req.query;
        let query = { status: { $in: ['Confirmed', 'Pending'] } };
        
        if (turfName) query.turfName = turfName;
        if (date) query.date = date;

        // Return only the fields needed to block UI (hide user details)
        const bookings = await Booking.find(query).select('turfName sport date timeSlot status');
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error("Get Public Bookings Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   GET /api/bookings
// @desc    Get all bookings (Partner Admin view)
// @access  Public
exports.getAllBookings = async (req, res) => {
    try {
        let query = {};
        
        // If requester is a Partner, only show bookings for THEIR venues
        if (req.user && req.user.role === 'partner') {
            const Venue = require('../models/Venue');
            const myVenues = await Venue.find({ owner: req.user.id });
            const myVenueNames = myVenues.map(v => v.name);
            query = { turfName: { $in: myVenueNames } };
        } 
        // If regular user (athlete), only show THEIR bookings
        else if (req.user && req.user.role !== 'admin') {
            query = { userId: req.user.id };
        }
        // Admin stays empty query (returns all)

        const bookings = await Booking.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        console.error("Get All Bookings Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   PATCH /api/bookings/:id
// @desc    Update booking status (Confirm/Approve/Reject)
// @access  Public
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // set color based on status for UI ease
        let color = 'bg-yellow-500'; // Pending default
        if (status === 'Confirmed') color = 'bg-emerald-500';
        if (status === 'Cancelled' || status === 'Rejected') color = 'bg-red-500';

        const booking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status, color }, 
            { new: true }
        );

        // Notify user of status change
        if (booking.userId) {
            await createNotification({
                recipient: booking.userId,
                type: 'BOOKING',
                message: `Your booking for ${booking.turfName} is now ${status}`,
                link: '/bookings'
            });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
