const express = require('express');
const router = express.Router();
const { addReview, getReviewsByVenue } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/:venueId', getReviewsByVenue); // GET /api/reviews/:venueId

module.exports = router;
