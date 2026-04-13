const Review = require('../models/Review');
const Venue = require('../models/Venue');
const { addXP } = require('./leaderboardController');

// @route   POST /api/reviews
// @desc    Add a review to a venue
exports.addReview = async (req, res) => {
    try {
        const { venueId, user, rating, comment } = req.body;
        
        // Ensure venue exists
        const venue = await Venue.findById(venueId);
        if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

        const review = await Review.create({
            venueId,
            userId: req.user ? req.user.id : null,
            user,
            rating,
            comment
        });

        // Autoupdate Venue Average Rating
        const allReviews = await Review.find({ venueId });
        const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        await Venue.findByIdAndUpdate(venueId, { rating: avg.toFixed(1) }, { returnDocument: 'after' });

        // Reward for adding a review
        if (req.user) {
            await addXP(req.user.id, 20);
        }

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   GET /api/reviews/:venueId
// @desc    Get all reviews for a specific venue
exports.getReviewsByVenue = async (req, res) => {
    try {
        const reviews = await Review.find({ venueId: req.params.venueId }).sort({ createdAt: -1 });
        
        // Optional Bonus: Calculate total average right here dynamically for the frontend
        let avgRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            avgRating = (sum / reviews.length).toFixed(1);
        }

        res.status(200).json({ success: true, data: reviews, meta: { totalCount: reviews.length, averageRating: avgRating } });
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @route   GET /api/reviews/highlights
// @desc    Get top rated reviews across the platform
exports.getEliteReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ rating: { $gte: 4 } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('venueId', 'name location image')
            .populate('userId', 'user_profile first_name last_name');
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("Get Elite Reviews Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
