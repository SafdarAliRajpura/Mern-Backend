const Discussion = require('../models/Discussion');
const CommunityEvent = require('../models/CommunityEvent');
const { createNotification } = require('./notificationController');
const { addXP } = require('./leaderboardController');

// Discussions
exports.getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('author', 'name first_name last_name user_profile')
      .populate('comments.user', 'name first_name last_name user_profile')
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const author = req.user.id;

    const newDiscussion = new Discussion({ author, title, content, category });
    await newDiscussion.save();

    res.status(201).json(newDiscussion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create discussion' });
  }
};

exports.toggleLikeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });

    const index = discussion.likes.indexOf(userId);
    if (index === -1) {
      discussion.likes.push(userId); // Like
    } else {
      discussion.likes.splice(index, 1); // Unlike
    }
    
    await discussion.save();

    // Trigger Notification for Like
    if (index === -1 && discussion.author.toString() !== userId) {
        await createNotification({
            recipient: discussion.author,
            sender: userId,
            type: 'LIKE',
            message: 'liked your discussion',
            link: '/community'
        });

        // Reward author for receiving a like
        await addXP(discussion.author, 5, 'likesReceived');
    }

    res.json({ likesCount: discussion.likes.length, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) return res.status(400).json({ error: 'Comment text is required' });

    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ error: 'Not found' });

    discussion.comments.push({ user: userId, text });
    await discussion.save();

    // Trigger Notification for Comment
    if (discussion.author.toString() !== userId) {
        await createNotification({
            recipient: discussion.author,
            sender: userId,
            type: 'COMMENT',
            message: 'replied to your discussion',
            link: '/community'
        });
    }

    // Reward for posting a comment
    await addXP(userId, 10, 'commentsPosted');

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};


// Events
exports.getEvents = async (req, res) => {
  try {
    const events = await CommunityEvent.find()
      .sort({ date: 1 })
      .populate('organizer', 'name first_name last_name')
      .populate('attendees', 'name first_name last_name');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, date, location, maxAttendees } = req.body;
    const organizer = req.user.id;

    const newEvent = new CommunityEvent({ title, date, location, maxAttendees, organizer });
    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

exports.toggleJoinEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const event = await CommunityEvent.findById(id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        const index = event.attendees.indexOf(userId);
        if (index === -1) {
            if (event.attendees.length >= event.maxAttendees) {
                return res.status(400).json({ error: 'Event is full' });
            }
            event.attendees.push(userId); // Join
        } else {
            event.attendees.splice(index, 1); // Leave
        }

        await event.save();
        res.json({ attendeesCount: event.attendees.length, isAttending: index === -1 });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle event attendance' });
    }
};
