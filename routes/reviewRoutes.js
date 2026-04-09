const express = require('express');
const router = express.Router();
const { addReview, getReviewsByVenue, getEliteReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addReview);
router.get('/highlights', getEliteReviews);
router.get('/:venueId', getReviewsByVenue); // GET /api/reviews/:venueId

module.exports = router;
