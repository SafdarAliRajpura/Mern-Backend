const mongoose = require('mongoose');
const Booking = require('./models/Booking');
require('dotenv').config();

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);
    const statuses = await Booking.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, samplePrice: { $first: "$price" } } }
    ]);
    
    console.log('Booking Status Distribution:');
    console.log(JSON.stringify(statuses, null, 2));

    process.exit();
}

debug();
