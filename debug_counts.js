const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Venue = require('./models/Venue');
require('dotenv').config();

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.countDocuments();
    const bookings = await Booking.countDocuments();
    const venues = await Venue.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    
    console.log({
        totalUsers: users,
        totalBookings: bookings,
        totalVenues: venues,
        confirmedBookings
    });
    
    const uniquePlayers = await Booking.distinct('userId');
    console.log('Unique UserIds in Bookings:', uniquePlayers.length);
    
    const uniqueUserNames = await Booking.distinct('user');
    console.log('Unique User names in Bookings:', uniqueUserNames.length);

    process.exit();
}

debug();
