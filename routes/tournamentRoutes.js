const express = require('express');
const router = express.Router();
const { 
    getTournaments, 
    getTournamentById, 
    getMyTournaments,
    createTournament, 
    updateTournament, 
    deleteTournament,
    registerTournament,
    getTournamentRegistrations
} = require('../controllers/tournamentController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getTournaments);
router.get('/my-tournaments', protect, authorize('partner', 'admin'), getMyTournaments);
router.get('/:id', getTournamentById);

// Public/Athlete registration
router.post('/:id/register', protect, registerTournament);

// Protected routes for partners and admin
router.get('/:id/registrations', protect, authorize('partner', 'admin'), getTournamentRegistrations);

// Protected routes for partners and admin
router.post('/', protect, authorize('partner', 'admin'), createTournament);
router.patch('/:id', protect, authorize('partner', 'admin'), updateTournament);
router.delete('/:id', protect, authorize('partner', 'admin'), deleteTournament);

module.exports = router;
