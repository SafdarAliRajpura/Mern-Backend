const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getUserTactics,
    getTacticById,
    getTacticByBooking,
    saveTactic,
    deleteTactic
} = require('../controllers/tacticController');

// All tactic routes require authentication
router.use(protect);

router.route('/')
    .get(getUserTactics)
    .post(saveTactic);

router.route('/booking/:bookingId')
    .get(getTacticByBooking);

router.route('/:id')
    .get(getTacticById)
    .delete(deleteTactic);

module.exports = router;
