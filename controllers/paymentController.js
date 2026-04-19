const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const { createNotification } = require('./notificationController');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log(`[RAZORPAY] Initialized with Key: ${process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...' : 'MISSING'}`);

// @route   POST /api/payments/order
// @desc    Create a Razorpay Order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { amount, bookingData } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        console.log(`[ORDER CREATION] Initiating order for ${req.user.first_name} | Amount: ₹${amount}`);

        // --- Tactical Concurrency Guard ---
        // Verify slot availability before initiating financial flow
        const { turfName, date, timeSlot } = bookingData;
        const conflict = await Booking.findOne({
            turfName,
            date,
            timeSlot,
            status: { $in: ['Confirmed', 'Pending'] }
        });

        if (conflict) {
            return res.status(400).json({ 
                success: false, 
                message: `Tactical Conflict! This slot was secured by another athlete while you were processing. Please choose another time.` 
            });
        }
        // ----------------------------------

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
            const booking = await Booking.findByIdAndUpdate(bookingId, {
                status: 'Confirmed',
                paymentId: razorpay_payment_id,
                color: 'bg-emerald-500'
            }, { returnDocument: 'after' });

            // Trigger Real-time System Notifications
            if (booking) {
                // 1. Notify the Athlete
                await createNotification({
                    recipient: booking.userId,
                    type: 'BOOKING',
                    message: `Payment Verified! Your slot at ${booking.turfName} is confirmed. View your credentials in 'My Bookings'.`,
                    link: '/bookings'
                });

                // 2. Notify the Venue Partner
                try {
                    const venue = await Venue.findOne({ name: booking.turfName });
                    if (venue && venue.owner) {
                        await createNotification({
                            recipient: venue.owner,
                            sender: booking.userId,
                            type: 'BOOKING',
                            message: `Payment Received: ${booking.user} confirmed a slot at ${venue.name}. Check your ledger.`,
                            link: '/partner/bookings'
                        });
                    }
                } catch (pNotifErr) {
                    console.error('Partner Notification Failure in Payment Sync:', pNotifErr);
                }
            }

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

// @route   GET /api/payments/checkout/:orderId
// @desc    Host a simple HTML page for Razorpay Checkout (Smooth Mobile Integration)
// @access  Public
exports.renderCheckout = async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log(`[PAYMENT GATEWAY] Initializing checkout for Order: ${orderId}`);
        
        const booking = await Booking.findOne({ orderId }).populate('userId', 'email first_name last_name');
        
        if (!booking) {
            console.error(`[PAYMENT GATEWAY] Booking not found for Order ID: ${orderId}`);
            return res.status(404).send('Booking not found in tactical ledger.');
        }

        const amountPaise = parseInt(booking.price) * 100;

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Arena Pro Checkout</title>
                    <style>
                        body { background: #070A14; color: #FFF; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                        .loader { border: 4px solid #1E293B; border-top: 4px solid #00FF00; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        h2 { margin-top: 25px; font-weight: 900; letter-spacing: 1px; color: #00FF00; font-size: 16px; text-align: center; }
                        p { color: #94A3B8; font-size: 12px; text-align: center; margin-top: 10px; }
                        .error-card { background: #131C31; border: 1px solid #FF4444; padding: 25px; border-radius: 20px; width: 100%; text-align: center; }
                        .retry-btn { background: #00FF00; color: #000; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 900; margin-top: 20px; width: 100%; }
                    </style>
                </head>
                <body>
                    <div id="loading-zone">
                        <div class="loader" style="margin: 0 auto;"></div>
                        <h2>SECURING MATCH GATEWAY...</h2>
                        <p>Preparing tactical checkout for ${booking.turfName}</p>
                    </div>

                    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                    <script>
                        function showError(msg) {
                            document.getElementById('loading-zone').innerHTML = 
                                "<div class='error-card'>" +
                                "<h2 style='color: #FF4444; margin-top: 0;'>PAYMENT BREACH</h2>" +
                                "<p>" + msg + "</p>" +
                                "<button class='retry-btn' onclick='location.reload()'>RETRY DEPLOYMENT</button>" +
                                "</div>";
                        }

                        try {
                            var options = {
                                "key": "${String(process.env.RAZORPAY_KEY_ID).trim()}",
                                "order_id": "${orderId}",
                                "name": "Arena Pro",
                                "description": ${JSON.stringify("Booking: " + booking.turfName)},
                                "handler": function (response){
                                    window.location.href = "footballturf://payment-success?razorpay_payment_id=" + response.razorpay_payment_id + "&razorpay_order_id=" + response.razorpay_order_id + "&razorpay_signature=" + response.razorpay_signature + "&bookingId=${booking._id}";
                                },
                                "prefill": {
                                    "name": ${JSON.stringify(booking.user)},
                                    "email": "${booking.userId?.email || 'athlete@arena.pro'}",
                                    "contact": "9999999999"
                                },
                                "theme": { "color": "#00FF00" },
                                "modal": {
                                    "ondismiss": function(){
                                        window.location.href = "footballturf://payment-cancel";
                                    }
                                }
                            };
                            var rzp1 = new Razorpay(options);
                            rzp1.on('payment.failed', function (response){
                                showError(response.error.description || response.error.reason || "The payment could not be processed by the bank.");
                            });
                            rzp1.open();
                        } catch (err) {
                            showError("Gateway Initialization Failed: " + err.message);
                        }
                    </script>
                </body>
            </html>
        `;
        res.send(html);
    } catch (error) {
        console.error("Render Checkout Error:", error);
        res.status(500).send('Tactical Error: Failed to launch financial gateway.');
    }
};
