const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Route files
  const userRoutes = require('./routes/userRoutes');
  const authRoutes = require('./routes/authRoutes');
  const venueRoutes = require('./routes/venueRoutes');
  const bookingRoutes = require('./routes/bookingRoutes');
  const reviewRoutes = require('./routes/reviewRoutes');
  const tournamentRoutes = require('./routes/tournamentRoutes');
  const analyticsRoutes = require('./routes/analyticsRoutes');
  const leaderboardRoutes = require('./routes/leaderboardRoutes');
  const contactRoutes = require('./routes/contactRoutes');
  const communityRoutes = require('./routes/communityRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  const searchRoutes = require('./routes/searchRoutes');
  const paymentRoutes = require('./routes/paymentRoutes');
  const tacticRoutes = require('./routes/tacticRoutes');
  const scorecardRoutes = require('./routes/scorecardRoutes');
  const draftRoutes = require('./routes/draftRoutes');

  // System Status route
  app.get('/api/status', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Operational' : 'Disconnected';
    res.json({
      status: 'Active',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  });

  // Main route
  app.get('/', (req, res) => {
    res.send('Turf Booking API is running...');
  });

  // Mount routes
  app.use('/api/users', userRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/venues', venueRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/tournaments', tournamentRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/tactics', tacticRoutes);
  app.use('/api/scorecards', scorecardRoutes);
  app.use('/api/drafts', draftRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.log('Failed to connect to database', error);
});

// Handle unhandled promise rejections to prevent silent crashes
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
