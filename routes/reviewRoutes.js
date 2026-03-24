const express = require('express');
const router = express.Router();
const { addReview, getReviewsByVenue } = require('../controllers/reviewController');

router.post('/', addReview);
router.get('/:venueId', getReviewsByVenue); // GET /api/reviews/:venueId

module.exports = router;
