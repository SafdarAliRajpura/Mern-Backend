const Venue = require('../models/Venue');
const mongoose = require('mongoose');

// @route   GET /api/venues
// @desc    Get all venues with optional filters
// @access  Public
exports.getVenues = async (req, res) => {
    try {
        let query = {};
        const { owner, search, sport } = req.query;

        // Base filter for active venues (for public discovery)
        if (!owner) {
            query.status = { $regex: /^active$/i };
        } else {
            query.owner = owner;
        }

        // Search by name or location
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by sport category
        if (sport && sport !== 'All') {
            query.sports = { $in: [new RegExp(`^${sport}$`, 'i')] };
        }

        const venues = await Venue.find(query)
            .populate('owner', 'first_name last_name user_profile')
            .sort({ rating: -1, createdAt: -1 });

        res.status(200).json({ success: true, count: venues.length, data: venues });
    } catch (error) {
        console.error('Get Venues Error:', error);
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
            { returnDocument: 'after', runValidators: true }
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

// @route   GET /api/venues/categories
// @desc    Get dynamic sport categories with counts
// @access  Public
exports.getSportCategories = async (req, res) => {
    try {
        const categories = await Venue.aggregate([
            { $match: { status: { $regex: /^active$/i } } },
            { $unwind: "$sports" },
            { $group: { 
                _id: "$sports", 
                count: { $sum: 1 },
                image: { $first: "$image" },
                description: { $first: "$location" }
            }},
            { $sort: { count: -1 } },
            { $limit: 6 }
        ]);
        
        // Enhance data for frontend
        const enhanced = categories.map(c => ({
            title: c._id,
            count: c.count,
            image: c.image || null,
            desc: `Experience premium ${c._id.toLowerCase()} facilities across ${c.count} verified arenas.`
        }));

        res.status(200).json({ success: true, data: enhanced });
    } catch (error) {
        console.error('Category Aggregation Error:', error);
        
        // Return premium fallbacks if DB is down to prevent frontend infinite loops
        const fallbacks = [
            { title: 'Football', count: 12, desc: 'FIFA-grade floodlights and premium grass.', image: '/assets/images/home/night-football.jpg' },
            { title: 'Cricket', count: 8, desc: 'Pro-level bowling machines and practice nets.', image: '/assets/images/home/cricket.jpg' },
            { title: 'Badminton', count: 5, desc: 'Indoor wooden courts with climate control.', image: '/assets/images/home/badminton.jpg' }
        ];

        res.status(200).json({ success: true, data: fallbacks, isFallback: true });
    }
};
