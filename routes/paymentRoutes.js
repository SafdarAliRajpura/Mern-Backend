const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, renderCheckout } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All payment routes are protected except the hosted checkout page (which is open via browser)
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/checkout/:orderId', renderCheckout);

module.exports = router;
