const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true }, // Format: "April 15, 2026"
    time: { type: String, required: true }, // Format: "09:00 AM"
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    totalSlots: { type: Number, required: true },
    minPlayers: { type: Number, default: 5 },
    maxPlayers: { type: Number, default: 11 },
    teamSize: { type: Number, default: 5 },
    registeredTeams: { type: Number, default: 0 },
    image: { type: String },
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastRegistrationDate: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
