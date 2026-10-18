const Scorecard = require('../models/Scorecard');
const Booking = require('../models/Booking');

// @route   POST /api/scorecards
// @desc    Create or update a match scorecard
// @access  Private
exports.saveScorecard = async (req, res) => {
    try {
        const {
            _id,
            bookingId,
            sport,
            matchTitle,
            venueName,
            date,
            timeSlot,
            matchFormat,
            teamA,
            teamB,
            cricketData,
            footballData,
            racketData,
            universalData,
            winner,
            resultSummary,
            mvp,
            notes
        } = req.body;

        const payload = {
            userId: req.user._id,
            bookingId: bookingId || req.body.bookingId || null,
            sport: sport || 'Cricket',
            matchTitle: matchTitle || 'Turf Matchday Clash',
            venueName: venueName || req.body.turfName || 'Arena Pro Turf',
            turfName: req.body.turfName || venueName || 'Arena Pro Turf',
            turfLocation: req.body.turfLocation || '',
            date: date || req.body.matchDate || new Date().toISOString().split('T')[0],
            matchDate: req.body.matchDate || date || new Date().toISOString().split('T')[0],
            timeSlot: timeSlot || req.body.matchTime || '',
            matchTime: req.body.matchTime || timeSlot || '',
            matchFormat: matchFormat || 'Standard',
            teamA: teamA || { name: 'Team Alpha', captain: '' },
            teamB: teamB || { name: 'Team Beta', captain: '' },
            cricketData: cricketData || req.body.cricketData || {},
            footballData: footballData || req.body.footballData || {},
            racketData: racketData || req.body.racketData || {},
            universalData: universalData || req.body.universalData || {},
            winner: winner || 'Draw',
            resultSummary: resultSummary || '',
            playerOfTheMatch: req.body.playerOfTheMatch || (mvp && mvp.name ? mvp.name : ''),
            mvp: mvp || (req.body.playerOfTheMatch ? { name: req.body.playerOfTheMatch, role: 'Player of the Match' } : {}),
            notes: notes || ''
        };

        let scorecard;

        if (_id) {
            scorecard = await Scorecard.findOneAndUpdate(
                { _id, userId: req.user._id },
                { $set: payload },
                { new: true, runValidators: true }
            );
        } else if (bookingId) {
            scorecard = await Scorecard.findOneAndUpdate(
                { bookingId, userId: req.user._id },
                { $set: payload },
                { new: true, upsert: true, runValidators: true }
            );
        } else {
            scorecard = await Scorecard.create(payload);
        }

        res.status(200).json({
            success: true,
            message: 'Scorecard successfully logged to Match Ledger',
            data: scorecard
        });
    } catch (error) {
        console.error('[SCORECARD CONTROLLER] Save Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to save match scorecard'
        });
    }
};

// @route   GET /api/scorecards
// @desc    Get all scorecards logged by current user
// @access  Private
exports.getUserScorecards = async (req, res) => {
    try {
        const query = { userId: req.user._id };
        if (req.query.sport && req.query.sport !== 'All') {
            query.sport = req.query.sport;
        }

        const scorecards = await Scorecard.find(query)
            .populate('bookingId', 'turfName date timeSlot sport price')
            .sort({ date: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: scorecards.length,
            data: scorecards
        });
    } catch (error) {
        console.error('[SCORECARD CONTROLLER] Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve scorecards' });
    }
};

// @route   GET /api/scorecards/:id
// @desc    Get single scorecard by ID
// @access  Private
exports.getScorecardById = async (req, res) => {
    try {
        const scorecard = await Scorecard.findById(req.params.id)
            .populate('bookingId', 'turfName date timeSlot sport price');

        if (!scorecard) {
            return res.status(404).json({ success: false, message: 'Scorecard not found' });
        }

        res.status(200).json({
            success: true,
            data: scorecard
        });
    } catch (error) {
        console.error('[SCORECARD CONTROLLER] Fetch One Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch match scorecard' });
    }
};

// @route   GET /api/scorecards/booking/:bookingId
// @desc    Get scorecard tied to a booking or booking metadata for prefilling
// @access  Private
exports.getScorecardByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const scorecard = await Scorecard.findOne({ bookingId });

        res.status(200).json({
            success: true,
            booking: {
                id: booking._id,
                turfName: booking.turfName,
                sport: booking.sport,
                date: booking.date,
                timeSlot: booking.timeSlot
            },
            data: scorecard || null
        });
    } catch (error) {
        console.error('[SCORECARD CONTROLLER] Booking Scorecard Error:', error);
        res.status(500).json({ success: false, message: 'Failed to check booking scorecard' });
    }
};

// @route   DELETE /api/scorecards/:id
// @desc    Delete a scorecard
// @access  Private
exports.deleteScorecard = async (req, res) => {
    try {
        const scorecard = await Scorecard.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!scorecard) {
            return res.status(404).json({ success: false, message: 'Scorecard not found or unauthorized' });
        }

        res.status(200).json({
            success: true,
            message: 'Scorecard deleted from ledger'
        });
    } catch (error) {
        console.error('[SCORECARD CONTROLLER] Delete Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete scorecard' });
    }
};

// @route   GET /api/scorecards/stats/career
// @desc    Aggregated career score stats for user profile
// @access  Private
exports.getUserCareerStats = async (req, res) => {
    try {
        const scorecards = await Scorecard.find({ userId: req.user._id });

        const stats = {
            totalMatches: scorecards.length,
            bySport: {
                Cricket: scorecards.filter(s => s.sport === 'Cricket').length,
                Football: scorecards.filter(s => s.sport === 'Football').length,
                Badminton: scorecards.filter(s => s.sport === 'Badminton' || s.sport === 'Tennis').length,
                Universal: scorecards.filter(s => s.sport === 'Universal').length
            },
            mvpCount: scorecards.filter(s => (s.playerOfTheMatch && s.playerOfTheMatch.trim().length > 0) || (s.mvp && s.mvp.name && s.mvp.name.trim().length > 0)).length
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[SCORECARD CONTROLLER] Career Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to calculate match career stats' });
    }
};
