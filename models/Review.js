const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user: { type: String, default: 'Football Fanatic' }, // Dummy auth fallback
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
