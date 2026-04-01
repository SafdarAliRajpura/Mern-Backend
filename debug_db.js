const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/football_turf';

async function checkDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to Database.');

        const venues = await Venue.find().populate('owner', 'email name role');
        console.log('--- VENUES ---');
        venues.forEach(v => {
            console.log(`Venue: ${v.name}`);
            console.log(`Owner: ${v.owner ? v.owner.email : 'NONE'}`);
            console.log(`Owner ID: ${v.owner ? v.owner._id : 'N/A'}`);
            console.log('---');
        });

        const partners = await User.find({ role: 'partner' });
        console.log('--- PARTNERS ---');
        partners.forEach(p => {
            console.log(`Partner: ${p.name}`);
            console.log(`Email: ${p.email}`);
            console.log(`ID: ${p._id}`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkDatabase();
