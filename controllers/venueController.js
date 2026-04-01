const Venue = require('../models/Venue');

// @route   GET /api/venues
// @desc    Get all venues
// @access  Public
exports.getVenues = async (req, res) => {
    try {
        const venues = await Venue.find().populate('owner');
        res.status(200).json({ success: true, count: venues.length, data: venues });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   GET /api/venues/:id
// @desc    Get single venue
// @access  Public
exports.getVenue = async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id).populate('owner');
        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }
        res.status(200).json({ success: true, data: venue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   POST /api/venues
// @desc    Create new venue
// @access  Public
exports.createVenue = async (req, res) => {
    try {
        req.body.owner = req.user.id;
        const venue = await Venue.create(req.body);
        res.status(201).json({ success: true, data: venue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   PATCH /api/venues/:id
// @desc    Update venue details (status, price, name, etc)
// @access  Admin/Partner
exports.updateVenueStatus = async (req, res) => {
    try {
        const updates = req.body;
        // Explicitly format for nested array override
        const updateDoc = { $set: {} };
        for(let key in updates) { updateDoc.$set[key] = updates[key]; }
        
        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            updateDoc,
            { new: true, runValidators: true }
        );

        if (!venue) {
            return res.status(404).json({ success: false, message: 'Venue not found' });
        }

        res.status(200).json({ success: true, data: venue });
    } catch (error) {
        console.error("Error updating venue status", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
