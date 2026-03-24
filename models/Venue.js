const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: 'ACTIVE' },
    image: { type: String },
    images: [{ type: String }],
    amenities: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sports: [{ type: String, default: ['Football'] }],
    slots: [{ type: String }],
    courts: [{
        name: { type: String },
        category: { type: String },
        price: { type: Number }
    }],
    rating: { type: Number, default: 4.5 },
    distance: { type: String, default: '2.5 km' },
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
