const mongoose = require('mongoose');
const Tournament = require('./models/Tournament');
const TournamentRegistration = require('./models/TournamentRegistration');

const repairDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/football_turf');
        console.log('Connected to DB');
        
        const tournaments = await Tournament.find({});
        for (const t of tournaments) {
            const count = await TournamentRegistration.countDocuments({ tournamentId: t._id });
            console.log(`Syncing ${t.name}: Found ${count} registrations. Updating...`);
            t.registeredTeams = count;
            // Use findOneAndUpdate to bypass any schema-level issues
            await Tournament.findOneAndUpdate({ _id: t._id }, { registeredTeams: count });
        }

        console.log('Database synchronization complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

repairDB();
