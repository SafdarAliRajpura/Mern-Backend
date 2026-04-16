const mongoose = require('mongoose');
const Tournament = require('./models/Tournament');
const TournamentRegistration = require('./models/TournamentRegistration');

const checkDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/football_turf');
        console.log('Connected to DB (football_turf)');
        
        const tournaments = await Tournament.find({});
        console.log('--- TOURNAMENTS METRICS ---');
        tournaments.forEach(t => {
            console.log(`[${t._id}] ${t.name}`);
            console.log(`Slots: ${t.totalSlots} | Registered: ${t.registeredTeams}`);
        });

        const registrations = await TournamentRegistration.find({});
        console.log('\n--- REGISTRATION LEDGER ---');
        console.log(`Total Count: ${registrations.length}`);
        registrations.forEach(r => {
            console.log(`Reg for ${r.tournamentId} | Team: ${r.teamName}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
