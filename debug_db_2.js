const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/football_turf';

async function checkDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        const partners = await User.find({ role: 'partner' });
        console.log('PARTNER_LIST:');
        partners.forEach(p => console.log(`${p.email} | ${p._id}`));
        
        const venues = await Venue.find();
        console.log('VENUE_LIST:');
        venues.forEach(v => console.log(`${v.name} | OWNER: ${v.owner || 'NONE'}`));
        
        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
checkDatabase();
