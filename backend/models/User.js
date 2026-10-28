import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Senior Full Stack Engineer' },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    plan: { type: String, default: 'Pro Plan' },
    resumesAnalyzed: { type: Number, default: 0 },
    averageAtsScore: { type: Number, default: 85 },
    averageJobMatch: { type: Number, default: 80 },
    targetRole: { type: String, default: 'Lead Frontend Engineer / Full Stack Architect' },
    location: { type: String, default: 'San Francisco, CA (Open to Remote)' },
    joinedDate: { type: String, default: 'January 2026' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// NOTE: Password hashing is handled in authController before calling dataStore.users.create()
// Do NOT hash here — that would cause double-hashing and make login impossible.

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
