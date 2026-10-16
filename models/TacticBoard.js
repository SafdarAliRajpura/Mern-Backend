const mongoose = require('mongoose');

const playerNodeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, default: 'Player' },
    number: { type: Number, default: 10 },
    role: { type: String, default: 'MID' },
    isCaptain: { type: Boolean, default: false },
    x: { type: Number, required: true }, // Percentage (0-100)
    y: { type: Number, required: true }, // Percentage (0-100)
    isSub: { type: Boolean, default: false }
}, { _id: false });

const drawingStrokeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    tool: { type: String, enum: ['pass', 'run', 'press'], default: 'pass' },
    color: { type: String, default: '#00F3FF' },
    points: [{
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    }]
}, { _id: false });

const tacticBoardSchema = new mongoose.Schema({
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
    title: {
        type: String,
        default: 'Matchday Tactical Plan',
        trim: true
    },
    sport: {
        type: String,
        default: 'Football'
    },
    pitchFormat: {
        type: String,
        default: '5v5'
    },
    formation: {
        type: String,
        default: '1-2-1'
    },
    players: [playerNodeSchema],
    drawings: [drawingStrokeSchema],
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

tacticBoardSchema.index({ userId: 1 });
tacticBoardSchema.index({ bookingId: 1 });

module.exports = mongoose.model('TacticBoard', tacticBoardSchema);
