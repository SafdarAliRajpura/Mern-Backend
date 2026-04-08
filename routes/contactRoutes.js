const express = require('express');
const router = express.Router();
const { 
  submitContact, 
  getContacts, 
  markAsRead, 
  deleteContact,
  replyToContact
} = require('../controllers/contactController');

// Submit new contact form (Public frontend)
router.post('/', submitContact);

// Admin endpoints
router.get('/', getContacts);
router.put('/:id/read', markAsRead);
router.post('/:id/reply', replyToContact);
router.delete('/:id', deleteContact);

module.exports = router;
