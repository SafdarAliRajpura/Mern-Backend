const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find({}).populate('venue', 'name location');
    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('venue', 'name location');
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Private (Partner/Admin)
const createTournament = async (req, res) => {
  try {
    const { name, venue, category, date, location, prizePool, entryFee, format, totalSlots } = req.body;
    
    // Add partner from protected req.user
    const tournament = await Tournament.create({
      name, venue, category, date, location, prizePool, entryFee, format, totalSlots,
      partner: req.user.id
    });

    res.status(201).json({ success: true, data: tournament });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating tournament', error: error.message });
  }
};

// @desc    Register a team for tournament
// @route   POST /api/tournaments/:id/register
// @access  Private (User)
const registerForTournament = async (req, res) => {
  try {
    const { teamName, captainName, contactNumber, email } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    if (tournament.registeredTeams >= tournament.totalSlots) {
       return res.status(400).json({ success: false, message: 'Tournament slots are full' });
    }

    const registration = await Registration.create({
      tournament: req.params.id,
      user: req.user.id,
      teamName, captainName, contactNumber, email,
      status: 'Confirmed' // Direct confirmation for now
    });

    // Increment registeredTeams
    tournament.registeredTeams += 1;
    if(tournament.registeredTeams >= tournament.totalSlots) {
        tournament.status = 'Waitlist';
    } else if (tournament.registeredTeams >= (tournament.totalSlots * 0.8)) {
        tournament.status = 'Filling Fast';
    }
    await tournament.save();

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

module.exports = {
  getTournaments,
  getTournament,
  createTournament,
  registerForTournament
};
