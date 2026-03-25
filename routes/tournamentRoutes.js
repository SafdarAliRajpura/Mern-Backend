const express = require('express');
const router = express.Router();
const { getTournaments, getTournament, createTournament, registerForTournament } = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTournaments)
  .post(protect, authorize('partner', 'admin'), createTournament);

router.route('/:id')
  .get(getTournament);

router.route('/:id/register')
  .post(protect, registerForTournament);

module.exports = router;
