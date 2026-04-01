const express = require('express');
const router = express.Router();
const { getUsers, toggleUserBan, approvePartner, rejectPartner } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/ban', protect, authorize('admin'), toggleUserBan);

// Partner Approval Routes
router.put('/:id/approve-partner', protect, authorize('admin'), approvePartner);
router.delete('/:id/reject-partner', protect, authorize('admin'), rejectPartner);

module.exports = router;
