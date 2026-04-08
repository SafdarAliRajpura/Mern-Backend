const Contact = require('../models/Contact');
const { sendInquiryReplyEmail } = require('../utils/sendEmail');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Server error while submitting message.' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Server error while fetching contacts.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(id, { status: 'read' }, { new: true });
    
    if (!contact) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json({ message: 'Message marked as read.', contact });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ error: 'Server error while updating contact status.' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Server error while deleting contact.' });
  }
};

exports.replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ error: 'Reply message is required.' });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    // Send the email
    sendInquiryReplyEmail({
        email: contact.email,
        name: contact.name,
        subject: contact.subject,
        originalMessage: contact.message,
        replyMessage
    });

    // Mark as read after replying
    contact.status = 'read';
    await contact.save();

    res.status(200).json({ message: 'Reply sent successfully and message marked as read.', contact });
  } catch (error) {
    console.error('Error replying to contact:', error);
    res.status(500).json({ error: 'Server error while sending reply.' });
  }
};
