const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First Name is required'],
    },
    last_name: {
      type: String,
      required: [true, 'Last Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    mobileNumber: {
      type: Number,
      required: [true, 'Mobile Number is required'],
    },
    user_profile: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'partner'],
      default: 'user',
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true, // Default true for normal users
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    businessName: {
      type: String,
      required: false,
    },
    supportEmail: { type: String },
    supportPhone: { type: String },
    gstNumber: { type: String },
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    brandLogo: { type: String },
    upiId: {
      type: String,
      required: false,
    },
    websiteLink: {
      type: String,
      required: false,
    },
    // Gamification & Social
    xp: { type: Number, default: 0 },
    skillLevel: { 
      type: String, 
      enum: ['Rookie', 'Amateur', 'Semi-Pro', 'Pro', 'Elite', 'Legend'],
      default: 'Rookie' 
    },
    stats: {
      totalBookings: { type: Number, default: 0 },
      discussionsCreated: { type: Number, default: 0 },
      commentsPosted: { type: Number, default: 0 },
      likesReceived: { type: Number, default: 0 }
    },
    socialLinks: {
      instagram: String,
      twitter: String
    },
    bio: { type: String, maxLength: 200 },
    primaryRole: { type: String, default: 'Athlete' },
    favoriteSports: [{ type: String }],
    badges: [{
      name: String,
      icon: String, // 'lucide-icon-name'
      color: String,
      unlockedAt: { type: Date, default: Date.now }
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
