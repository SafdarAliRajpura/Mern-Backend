const mongoose = require('mongoose');

const draftedPlayerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, default: 'All-Rounder' },
    ovr: { type: Number, default: 80 },
    pickedAtRound: { type: Number, default: 1 }
}, { _id: false });

const draftSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    sport: {
        type: String,
        default: 'Cricket'
    },
    turfName: {
        type: String,
        default: 'Arena Pro Turf'
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    format: {
        type: String,
        default: '6v6 Box'
    },
    captainA: {
        name: { type: String, default: 'Captain A' },
        teamName: { type: String, default: 'Team Alpha' }
    },
    captainB: {
        name: { type: String, default: 'Captain B' },
        teamName: { type: String, default: 'Team Beta' }
    },
    tossWinner: {
        type: String,
        default: 'A'
    },
    tossDecision: {
        type: String,
        default: 'first_pick'
    },
    draftStrategy: {
        type: String,
        enum: ['snake', 'alternate', 'auto_fair'],
        default: 'snake'
    },
    teamA: [draftedPlayerSchema],
    teamB: [draftedPlayerSchema],
    unpickedPool: [draftedPlayerSchema],
    status: {
        type: String,
        enum: ['setup', 'in_progress', 'completed'],
        default: 'completed'
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

draftSessionSchema.index({ userId: 1 });
draftSessionSchema.index({ bookingId: 1 });

module.exports = mongoose.model('DraftSession', draftSessionSchema);
