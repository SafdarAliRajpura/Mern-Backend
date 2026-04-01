const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/football_turf';

async function repairOwnership() {
    try {
        await mongoose.connect(MONGO_URI);
        
        // 1. Get the first partner
        const firstPartner = await User.findOne({ role: 'partner' });
        if (!firstPartner) {
            console.log('Error: No partner account exists to assign venues to.');
            return;
        }

        console.log(`Assigning orphaned venues to: ${firstPartner.email} (${firstPartner._id})`);

        // 2. Find venues without owners
        const result = await Venue.updateMany(
            { $or: [{ owner: null }, { owner: { $exists: false } }] },
            { $set: { owner: firstPartner._id } }
        );

        console.log(`Successfully updated ${result.modifiedCount} venues.`);
        
        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}
repairOwnership();
