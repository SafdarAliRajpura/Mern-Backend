const TacticBoard = require('../models/TacticBoard');
const Booking = require('../models/Booking');

// @route   GET /api/tactics
// @desc    Get all saved tactics for the logged in user
// @access  Private
exports.getUserTactics = async (req, res) => {
    try {
        const tactics = await TacticBoard.find({ userId: req.user._id })
            .populate('bookingId', 'turfName date timeSlot sport')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: tactics.length,
            data: tactics
        });
    } catch (error) {
        console.error('[TACTIC CONTROLLER] Error fetching user tactics:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve tactics' });
    }
};

// @route   GET /api/tactics/:id
// @desc    Get a single tactic by ID
// @access  Private
exports.getTacticById = async (req, res) => {
    try {
        const tactic = await TacticBoard.findById(req.params.id)
            .populate('bookingId', 'turfName date timeSlot sport');

        if (!tactic) {
            return res.status(404).json({ success: false, message: 'Tactic plan not found' });
        }

        res.status(200).json({
            success: true,
            data: tactic
        });
    } catch (error) {
        console.error('[TACTIC CONTROLLER] Error fetching tactic by ID:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve tactic plan' });
    }
};

// @route   GET /api/tactics/booking/:bookingId
// @desc    Get or inspect tactic tied to a booking
// @access  Private
exports.getTacticByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        let tactic = await TacticBoard.findOne({ bookingId });

        res.status(200).json({
            success: true,
            booking: {
                id: booking._id,
                turfName: booking.turfName,
                sport: booking.sport,
                date: booking.date,
                timeSlot: booking.timeSlot
            },
            data: tactic || null
        });
    } catch (error) {
        console.error('[TACTIC CONTROLLER] Error fetching booking tactic:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve booking tactic' });
    }
};

// @route   POST /api/tactics
// @desc    Create or update a tactic
// @access  Private
exports.saveTactic = async (req, res) => {
    try {
        const {
            _id,
            bookingId,
            title,
            sport,
            pitchFormat,
            formation,
            players,
            drawings,
            notes
        } = req.body;

        const tacticPayload = {
            userId: req.user._id,
            bookingId: bookingId || null,
            title: title || 'Matchday Tactical Plan',
            sport: sport || 'Football',
            pitchFormat: pitchFormat || '5v5',
            formation: formation || '1-2-1',
            players: Array.isArray(players) ? players : [],
            drawings: Array.isArray(drawings) ? drawings : [],
            notes: notes || ''
        };

        let tactic;

        // If _id provided, update existing
        if (_id) {
            tactic = await TacticBoard.findOneAndUpdate(
                { _id, userId: req.user._id },
                { $set: tacticPayload },
                { new: true, runValidators: true }
            );
        } else if (bookingId) {
            // If bookingId provided, check if a tactic already exists for this booking
            tactic = await TacticBoard.findOneAndUpdate(
                { bookingId, userId: req.user._id },
                { $set: tacticPayload },
                { new: true, upsert: true, runValidators: true }
            );
        } else {
            // Create brand new standalone tactic
            tactic = await TacticBoard.create(tacticPayload);
        }

        res.status(200).json({
            success: true,
            message: 'Tactical plan securely saved',
            data: tactic
        });
    } catch (error) {
        console.error('[TACTIC CONTROLLER] Error saving tactic:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to save tactical plan' });
    }
};

// @route   DELETE /api/tactics/:id
// @desc    Delete a tactic
// @access  Private
exports.deleteTactic = async (req, res) => {
    try {
        const tactic = await TacticBoard.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!tactic) {
            return res.status(404).json({ success: false, message: 'Tactic plan not found or unauthorized' });
        }

        res.status(200).json({
            success: true,
            message: 'Tactical plan deleted'
        });
    } catch (error) {
        console.error('[TACTIC CONTROLLER] Error deleting tactic:', error);
        res.status(500).json({ success: false, message: 'Failed to delete tactical plan' });
    }
};
