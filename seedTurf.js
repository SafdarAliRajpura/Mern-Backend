require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('./models/Venue');

async function seedTopTurf() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/football_turf', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Check if our specific turf already exists
        const existing = await Venue.findOne({ name: 'Arena Pro Elite' });
        if (existing) {
            console.log('Top turf already exists.');
            process.exit(0);
        }

        const topTurf = new Venue({
            name: 'Arena Pro Elite',
            location: 'Navi Mumbai, MH',
            price: 2000,
            status: 'ACTIVE',
            image: '/uploads/top-turf.jpg', 
            amenities: ['Floodlights', 'Dressing Room', 'Cafeteria'],
            sports: ['Football', 'Cricket'],
            rating: 5.0,
            distance: '1.2 km',
            coordinates: { lat: 19.0330, lng: 73.0297 }
        });

        await topTurf.save();
        console.log('Successfully seeded the top rated turf!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedTopTurf();
