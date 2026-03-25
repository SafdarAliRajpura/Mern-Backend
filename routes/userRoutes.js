const express = require('express');
const router = express.Router();
const { getUsers, toggleUserBan } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/ban', protect, authorize('admin'), toggleUserBan);

module.exports = router;
