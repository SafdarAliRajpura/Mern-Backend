const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    saveDraftSession,
    getUserDraftSessions,
    getDraftSessionById,
    deleteDraftSession
} = require('../controllers/draftController');

// All draft session routes require authentication
router.use(protect);

router.route('/')
    .get(getUserDraftSessions)
    .post(saveDraftSession);

router.route('/:id')
    .get(getDraftSessionById)
    .delete(deleteDraftSession);

module.exports = router;
