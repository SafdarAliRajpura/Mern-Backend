const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, onboardPartner, updateProfile, changePassword, updatePushToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/onboard', protect, onboardPartner);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
