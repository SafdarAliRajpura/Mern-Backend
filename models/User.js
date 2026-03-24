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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
