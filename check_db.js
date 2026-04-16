const mongoose = require('mongoose');
const Tournament = require('./backend/models/Tournament');
const TournamentRegistration = require('./backend/models/TournamentRegistration');

const checkDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/turf_booking');
        console.log('Connected to DB');
        
        const tournaments = await Tournament.find({});
        console.log('Tournaments Found:', tournaments.length);
        
        tournaments.forEach(t => {
            console.log(`- Tournament: ${t.name}`);
            console.log(`  Total Slots: ${t.totalSlots}`);
            console.log(`  Registered Teams (from model): ${t.registeredTeams}`);
        });

        const registrations = await TournamentRegistration.find({});
        console.log('\nTotal Registrations Found:', registrations.length);
        registrations.forEach(r => {
            console.log(`- Reg for Tournament ID: ${r.tournamentId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
