const express = require('express');
const router = express.Router();
const { getUsers, toggleUserBan } = require('../controllers/userController');

router.route('/').get(getUsers);
router.route('/:id/ban').put(toggleUserBan);

module.exports = router;
