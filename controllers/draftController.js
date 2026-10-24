const mongoose = require('mongoose');
const DraftSession = require('../models/DraftSession');

// @route   POST /api/drafts
// @desc    Save or update a drafted squad session
// @access  Private
exports.saveDraftSession = async (req, res) => {
    try {
        const {
            _id,
            bookingId,
            sport,
            turfName,
            date,
            format,
            captainA,
            captainB,
            tossWinner,
            tossDecision,
            draftStrategy,
            teamA,
            teamB,
            unpickedPool,
            status,
            notes
        } = req.body;

        const validBookingId = (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) ? bookingId : null;
        const validSessionId = (_id && mongoose.Types.ObjectId.isValid(_id)) ? _id : null;

        const payload = {
            userId: req.user._id,
            bookingId: validBookingId,
            sport: sport || 'Cricket',
            turfName: turfName || 'Arena Pro Turf',
            date: date || new Date().toISOString().split('T')[0],
            format: format || '6v6 Box',
            captainA: captainA || { name: 'Captain A', teamName: 'Team Alpha' },
            captainB: captainB || { name: 'Captain B', teamName: 'Team Beta' },
            tossWinner: tossWinner || 'A',
            tossDecision: tossDecision || 'first_pick',
            draftStrategy: draftStrategy || 'snake',
            teamA: teamA || [],
            teamB: teamB || [],
            unpickedPool: unpickedPool || [],
            status: status || 'completed',
            notes: notes || ''
        };

        let session;
        if (validSessionId) {
            session = await DraftSession.findOneAndUpdate(
                { _id: validSessionId, userId: req.user._id },
                { $set: payload },
                { new: true, runValidators: true }
            );
        } else if (validBookingId) {
            session = await DraftSession.findOneAndUpdate(
                { bookingId: validBookingId, userId: req.user._id },
                { $set: payload },
                { new: true, upsert: true, runValidators: true }
            );
        } else {
            session = await DraftSession.create(payload);
        }

        res.status(200).json({
            success: true,
            message: 'Draft squad session saved successfully',
            data: session
        });
    } catch (error) {
        console.error('[DRAFT CONTROLLER] Save Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to save draft squad session'
        });
    }
};

// @route   GET /api/drafts
// @desc    Get all draft sessions for authenticated user
// @access  Private
exports.getUserDraftSessions = async (req, res) => {
    try {
        const sessions = await DraftSession.find({ userId: req.user._id })
            .populate('bookingId', 'turfName date timeSlot sport')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        console.error('[DRAFT CONTROLLER] Get History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve draft sessions' });
    }
};

// @route   GET /api/drafts/:id
// @desc    Get single draft session by ID
// @access  Private
exports.getDraftSessionById = async (req, res) => {
    try {
        const session = await DraftSession.findById(req.params.id)
            .populate('bookingId', 'turfName date timeSlot sport');

        if (!session) {
            return res.status(404).json({ success: false, message: 'Draft session not found' });
        }

        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('[DRAFT CONTROLLER] Get One Error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve draft session' });
    }
};

// @route   DELETE /api/drafts/:id
// @desc    Delete a draft session
// @access  Private
exports.deleteDraftSession = async (req, res) => {
    try {
        const session = await DraftSession.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Draft session not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Draft session deleted'
        });
    } catch (error) {
        console.error('[DRAFT CONTROLLER] Delete Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete draft session' });
    }
};
