const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDiscussions,
  createDiscussion,
  toggleLikeDiscussion,
  addComment,
  getEvents,
  createEvent,
  toggleJoinEvent
} = require('../controllers/communityController');

// Discussions
router.get('/discussions', getDiscussions);
router.post('/discussions', protect, createDiscussion);
router.put('/discussions/:id/like', protect, toggleLikeDiscussion);
router.post('/discussions/:id/comment', protect, addComment);

// Events
router.get('/events', getEvents);
router.post('/events', protect, createEvent);
router.put('/events/:id/join', protect, toggleJoinEvent);

module.exports = router;
