const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user: { type: String, default: 'Guest User' }, // Since auth might not be fully persisted locally, storing name helps
    turfName: { type: String, required: true },
    sport: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    color: { type: String, default: 'bg-yellow-500' },
    
    // Financial Ledger Fields
    adminCommission: { type: Number, default: 0 },
    partnerShare: { type: Number, default: 0 },
    orderId: { type: String },
    paymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
