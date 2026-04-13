const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payments/order
// @desc    Create a Razorpay Order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { amount, bookingData } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        // Razorpay expects amount in paise (multiply by 100)
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Pre-calculate commission for our ledger
        const commissionRate = process.env.COMMISSION_RATE || 10;
        const adminCommission = (amount * commissionRate) / 100;
        const partnerShare = amount - adminCommission;

        // Create a Pending booking in our database linked to this order
        const newBooking = await Booking.create({
            ...bookingData,
            userId: req.user.id,
            user: `${req.user.first_name} ${req.user.last_name}`,
            status: 'Pending',
            orderId: order.id,
            adminCommission,
            partnerShare,
            price: amount.toString()
        });

        res.status(200).json({
            success: true,
            order,
            bookingId: newBooking._id
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: 'Failed to initiate payment engine' });
    }
};

// @route   POST /api/payments/verify
// @desc    Verify Razorpay Signature and confirm booking
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            bookingId
        } = req.body;

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update booking status to Confirmed
            await Booking.findByIdAndUpdate(bookingId, {
                status: 'Confirmed',
                paymentId: razorpay_payment_id,
                color: 'bg-emerald-500'
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully. Tactical deployment confirmed.'
            });
        } else {
            res.status(400).json({ success: false, message: 'Signature verification failed. Potential breach detected.' });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: 'Server error during financial verification' });
    }
};
