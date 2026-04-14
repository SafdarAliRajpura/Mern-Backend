const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');
const { notifyAdmins, createNotification } = require('./notificationController');

// ... (existing analytics/crud methods)

// @route   POST /api/tournaments/:id/register
// @desc    Register a team for a tournament
// @access  Private (Athlete)
exports.registerTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        // Check for duplicate registration by same user/email
        const existing = await TournamentRegistration.findOne({ 
            tournamentId: req.params.id, 
            $or: [{ userId: req.user.id }, { email: req.body.email }] 
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already registered a team for this event.' });
        }

        const registration = await TournamentRegistration.create({
            ...req.body,
            tournamentId: req.params.id,
            userId: req.user.id
        });

        // 1. Notify the Athlete
        await createNotification({
            recipient: req.user.id,
            type: 'TOURNAMENT',
            message: `Squad Registered: ${registration.teamName} is confirmed for ${tournament.name}!`,
            link: '/tournaments'
        });

        // 2. Notify the Tournament Partner (Host)
        if (tournament.owner) {
            await createNotification({
                recipient: tournament.owner,
                sender: req.user.id,
                type: 'TOURNAMENT',
                message: `New Competitor: ${registration.teamName} (Capt. ${registration.captainName}) joined ${tournament.name}.`,
                link: '/partner/tournaments'
            });
        }

        res.status(201).json({ success: true, data: registration });
    } catch (error) {
        console.error("Tournament Registration Error:", error);
        res.status(500).json({ success: false, message: 'Failed to process tournament enrollment.' });
    }
};

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

        // Notify Admins about new Tournament
        notifyAdmins({
            type: 'TOURNAMENT',
            message: `New Tournament Hosted: ${tournament.name} at ${tournament.location}`,
            link: '/admin/tournaments'
        });

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
