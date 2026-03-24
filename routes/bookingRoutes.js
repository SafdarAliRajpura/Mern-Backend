const express = require('express');
const router = express.Router();
const { createBooking, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');

router.route('/')
    .post(createBooking)
    .get(getAllBookings); // For both User Bookings page (fetches all for MVP) and Partner Dashboard

router.route('/:id')
    .patch(updateBookingStatus); // Status update (Partner)

module.exports = router;
