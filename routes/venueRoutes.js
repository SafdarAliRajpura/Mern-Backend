const express = require('express');
const router = express.Router();
const { getVenues, getVenue, createVenue, updateVenueStatus, getSportCategories } = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/categories', getSportCategories);
router.get('/', getVenues);
router.post('/', protect, authorize('partner', 'admin'), createVenue);
router.get('/:id', getVenue);
router.patch('/:id', protect, authorize('partner', 'admin'), updateVenueStatus);

module.exports = router;
