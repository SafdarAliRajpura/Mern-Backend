const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    saveScorecard,
    getUserScorecards,
    getScorecardById,
    getScorecardByBooking,
    deleteScorecard,
    getUserCareerStats
} = require('../controllers/scorecardController');

// All scorecard routes require authentication
router.use(protect);

router.route('/')
    .get(getUserScorecards)
    .post(saveScorecard);

router.get('/career-stats', getUserCareerStats);
router.get('/stats/career', getUserCareerStats);
router.get('/by-booking/:bookingId', getScorecardByBooking);
router.get('/booking/:bookingId', getScorecardByBooking);

router.route('/:id')
    .get(getScorecardById)
    .delete(deleteScorecard);

module.exports = router;
