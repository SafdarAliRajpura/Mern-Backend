const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');
const { notifyAdmins, createNotification } = require('./notificationController');
const { sendTournamentRegistrationEmail } = require('../utils/sendEmail');

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

        // Increment registered teams count using atomic $inc for maximum reliability
        await Tournament.findByIdAndUpdate(req.params.id, { 
            $inc: { registeredTeams: 1 } 
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

        // 3. Send Email Confirmation to Athlete
        sendTournamentRegistrationEmail({
            email: req.user.email,
            name: `${req.user.first_name} ${req.user.last_name}`,
            tournamentName: tournament.name,
            teamName: req.body.teamName,
            entryFee: tournament.entryFee,
            date: tournament.date,
            players: req.body.players
        });

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

// @route   GET /api/tournaments/my-tournaments
// @desc    Get all tournaments owned by the current partner
// @access  Private (Partner/Admin)
exports.getMyTournaments = async (req, res) => {
    try {
        const query = (req.user && req.user.role === 'admin') ? {} : { owner: req.user.id };
        const tournaments = await Tournament.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
    } catch (error) {
        console.error("Fetch My Tournaments Error:", error);
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

// @route   GET /api/tournaments/:id/registrations
// @desc    Get all registrations for a tournament
// @access  Private (Partner/Admin)
exports.getTournamentRegistrations = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        // Only owner or admin can see registrations
        if (tournament.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized intelligence access.' });
        }

        const registrations = await TournamentRegistration.find({ tournamentId: req.params.id })
            .populate('userId', 'first_name last_name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: registrations.length, data: registrations });
    } catch (error) {
        console.error("Fetch Tournament Registrations Error:", error);
        res.status(500).json({ success: false, message: 'Failed to retrieve roster data.' });
    }
};
