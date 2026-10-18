const mongoose = require('mongoose');

const batsmanStatSchema = new mongoose.Schema({
    player: { type: String, required: true },
    team: { type: String, default: 'Team A' },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    dismissType: { type: String, default: 'not out' }
}, { _id: false });

const bowlerStatSchema = new mongoose.Schema({
    bowler: { type: String, required: true },
    team: { type: String, default: 'Team B' },
    overs: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 }
}, { _id: false });

const goalScorerSchema = new mongoose.Schema({
    player: { type: String, required: true },
    team: { type: String, default: 'Team A' },
    minute: { type: String, default: '' },
    isPenalty: { type: Boolean, default: false },
    assist: { type: String, default: '' }
}, { _id: false });

const racketSetSchema = new mongoose.Schema({
    setNumber: { type: Number, required: true },
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    winner: { type: String, default: '' }
}, { _id: false });

const scorecardSchema = new mongoose.Schema({
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
        enum: ['Cricket', 'Football', 'Badminton', 'Tennis', 'Universal'],
        default: 'Cricket'
    },
    matchTitle: {
        type: String,
        default: 'Turf Matchday Clash',
        trim: true
    },
    venueName: {
        type: String,
        default: 'Arena Pro Turf',
        trim: true
    },
    turfName: {
        type: String,
        default: 'Arena Pro Turf',
        trim: true
    },
    turfLocation: {
        type: String,
        default: '',
        trim: true
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    matchDate: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    timeSlot: {
        type: String,
        default: ''
    },
    matchTime: {
        type: String,
        default: ''
    },
    matchFormat: {
        type: String,
        default: 'Standard'
    },

    // Teams Metadata
    teamA: {
        name: { type: String, default: 'Team Alpha' },
        captain: { type: String, default: '' }
    },
    teamB: {
        name: { type: String, default: 'Team Beta' },
        captain: { type: String, default: '' }
    },

    // Sport Scoring Payloads (Flexible GoF Strategy structures)
    cricketData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    footballData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    racketData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    universalData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Outcome & Accolades
    winner: {
        type: String,
        default: 'Draw'
    },
    resultSummary: {
        type: String,
        default: ''
    },
    mvp: {
        name: { type: String, default: '' },
        role: { type: String, default: 'All-Rounder' },
        stats: { type: String, default: '' },
        badge: { type: String, default: 'Player of the Match' }
    },
    playerOfTheMatch: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

scorecardSchema.index({ userId: 1 });
scorecardSchema.index({ bookingId: 1 });
scorecardSchema.index({ sport: 1 });

module.exports = mongoose.model('Scorecard', scorecardSchema);
