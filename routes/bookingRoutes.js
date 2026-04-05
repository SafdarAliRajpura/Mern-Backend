const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, updateBookingStatus, getPublicBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/public')
    .get(getPublicBookings);

router.route('/')
    .post(protect, createBooking)
    .get(protect, authorize('user', 'partner', 'admin'), getAllBookings); 

router.route('/:id')
    .patch(protect, authorize('partner', 'admin'), updateBookingStatus);

module.exports = router;
