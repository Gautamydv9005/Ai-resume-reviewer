import mongoose from 'mongoose';

const guestSessionSchema = new mongoose.Schema({
  guestToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reviewsUsed: {
    type: Number,
    default: 0
  },
  isReviewInProgress: {
    type: Boolean,
    default: false
  },
  completedResumeId: {
    type: String,
    default: null
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 * 7 // TTL index: auto-expire sessions after 7 days
  }
}, {
  timestamps: true
});

export const GuestSession = mongoose.model('GuestSession', guestSessionSchema);
