const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBooking)
    .get(protect, authorize('partner', 'admin'), getAllBookings); 

router.route('/:id')
    .patch(protect, authorize('partner', 'admin'), updateBookingStatus);

module.exports = router;
