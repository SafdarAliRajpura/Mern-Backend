const express = require('express');
const router = express.Router();
const { getVenues, getVenue, createVenue, updateVenueStatus } = require('../controllers/venueController');

router.route('/').get(getVenues).post(createVenue);
router.route('/:id').get(getVenue).patch(updateVenueStatus);

module.exports = router;
