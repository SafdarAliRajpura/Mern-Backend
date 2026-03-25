const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Venue is required'],
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category (e.g., Football) is required'],
      enum: ['Football', 'Cricket', 'Badminton', 'Tennis'],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'Filling Fast', 'Waitlist', 'Completed'],
      default: 'Open',
    },
    date: {
      type: String, // "Aug 15 - Aug 20, 2024" or use Date objects for complex scheduling
      required: [true, 'Date is required'],
    },
    location: {
      type: String,
      required: [true, 'Display location is required'],
    },
    prizePool: {
        type: String,
        required: [true, 'Prize pool is required'],
    },
    entryFee: {
        type: String,
        required: [true, 'Entry fee is required'],
    },
    format: {
        type: String,
        required: [true, 'Format (e.g., 5v5 Knockout) is required'],
    },
    totalSlots: {
        type: Number,
        required: [true, 'Total team slots required'],
    },
    registeredTeams: {
        type: Number,
        default: 0
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
