const mongoose = require('mongoose');

const TournamentRegistrationSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true
    },
    captainName: {
        type: String,
        required: [true, 'Captain name is required']
    },
    email: {
        type: String,
        required: [true, 'Contact email is required']
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required']
    },
    players: [{
        type: String,
        required: true
    }],
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rejected'],
        default: 'Confirmed' // For simple versions; can be 'Pending' if payment is added later
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TournamentRegistration', TournamentRegistrationSchema);
