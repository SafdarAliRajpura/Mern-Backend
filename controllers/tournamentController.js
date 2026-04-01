const Tournament = require('../models/Tournament');

// @route   GET /api/tournaments
// @desc    Get all tournaments
// @access  Public
exports.getTournaments = async (req, res) => {
    try {
        let query = {};
        // If owner query was passed, filter by owner
        if (req.query.owner) {
            query = { owner: req.query.owner };
        }
        const tournaments = await Tournament.find(query).populate('owner', 'name email');
        res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
    } catch (error) {
        console.error("Get Tournaments Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   GET /api/tournaments/:id
// @desc    Get single tournament
// @access  Public
exports.getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('owner', 'name email');
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }
        res.status(200).json({ success: true, data: tournament });
    } catch (error) {
        console.error("Get Single Tournament Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   POST /api/tournaments
// @desc    Create new tournament
// @access  Partner/Admin
exports.createTournament = async (req, res) => {
    try {
        // Link to the authenticated user
        req.body.owner = req.user.id;
        const tournament = await Tournament.create(req.body);
        res.status(201).json({ success: true, data: tournament });
    } catch (error) {
        console.error("Create Tournament Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   PATCH /api/tournaments/:id
// @desc    Update tournament details
// @access  Partner/Admin
exports.updateTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }
        res.status(200).json({ success: true, data: tournament });
    } catch (error) {
        console.error("Update Tournament Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   DELETE /api/tournaments/:id
// @desc    Delete a tournament
// @access  Partner/Admin
exports.deleteTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findByIdAndDelete(req.params.id);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error("Delete Tournament Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
