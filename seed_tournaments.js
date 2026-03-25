const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tournament = require('./models/Tournament');
const Venue = require('./models/Venue');
const User = require('./models/User');

dotenv.config();

const seedTournaments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/football_turf');
    
    const partner = await User.findOne({ role: 'partner' });
    const venue = await Venue.findOne({});

    if (!partner || !venue) {
      console.log('Need a partner and a venue in DB to seed tournaments!');
      process.exit(1);
    }

    const t1 = await Tournament.create({
      name: "Mumbai Corporate Cup 2024",
      category: "Football",
      venue: venue._id,
      partner: partner._id,
      status: "Filling Fast",
      date: "Aug 15 - Aug 20, 2024",
      location: venue.location,
      prizePool: "50,000",
      entryFee: "4,000",
      format: "5v5 Knockout",
      totalSlots: 16,
      registeredTeams: 12
    });

    const t2 = await Tournament.create({
      name: "Pro Cricket League Season 4",
      category: "Cricket",
      venue: venue._id,
      partner: partner._id,
      status: "Open",
      date: "Sept 01 - Sept 10, 2024",
      location: venue.location,
      prizePool: "1,00,000",
      entryFee: "8,000",
      format: "Box Cricket",
      totalSlots: 20,
      registeredTeams: 8
    });

    console.log('Seeded 2 Tournaments!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedTournaments();
