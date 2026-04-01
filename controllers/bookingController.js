const Booking = require('../models/Booking');

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
        const booking = await Booking.create(req.body);
        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   GET /api/bookings
// @desc    Get all bookings (Partner Admin view)
// @access  Public
exports.getAllBookings = async (req, res) => {
    try {
        // If it's a regular user, only show THEIR bookings
        // If it's an admin, show all (for the admin panel)
        let query = {};
        if (req.user && req.user.role !== 'admin') {
            query = { userId: req.user.id };
        }

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

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
