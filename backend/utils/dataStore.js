import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { Analysis } from '../models/Analysis.js';
import { AtsReport } from '../models/AtsReport.js';
import { JobMatch } from '../models/JobMatch.js';
import { GuestSession } from '../models/GuestSession.js';
import {
  defaultUser,
  defaultResumes,
  defaultAnalyses,
  defaultAtsReports,
  defaultJobMatches
} from './seedData.js';

// In-memory collections
let memUsers = [{ ...defaultUser }];
let memResumes = [...defaultResumes];
let memAnalyses = { ...defaultAnalyses };
let memAtsReports = { ...defaultAtsReports };
let memJobMatches = { ...defaultJobMatches };
let memGuestSessions = {};

const isMongoActive = () => mongoose.connection.readyState === 1;

/**
 * Seed MongoDB if connected and empty
 */
export async function seedMongoIfEmpty() {
  if (!isMongoActive()) return;

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPass = await bcrypt.hash(defaultUser.password, 10);
      await User.create({ ...defaultUser, password: hashedPass });
      console.log('[Seed] Default user Alex Morgan seeded into MongoDB.');
    }

    const resumeCount = await Resume.countDocuments();
    if (resumeCount === 0) {
      await Resume.insertMany(defaultResumes);
      console.log('[Seed] Sample resumes seeded into MongoDB.');
    }

    const analysisCount = await Analysis.countDocuments();
    if (analysisCount === 0) {
      const analysesList = Object.values(defaultAnalyses);
      await Analysis.insertMany(analysesList);
      console.log('[Seed] Sample analyses seeded into MongoDB.');
    }

    const atsCount = await AtsReport.countDocuments();
    if (atsCount === 0) {
      const atsList = Object.values(defaultAtsReports);
      await AtsReport.insertMany(atsList);
      console.log('[Seed] Sample ATS reports seeded into MongoDB.');
    }

    const jobCount = await JobMatch.countDocuments();
    if (jobCount === 0) {
      const jobList = Object.values(defaultJobMatches);
      await JobMatch.insertMany(jobList);
      console.log('[Seed] Sample Job matches seeded into MongoDB.');
    }
  } catch (err) {
    console.warn('[Seed] Warning during initial seed:', err.message);
  }
}

/**
 * DataStore Methods
 */
export const dataStore = {
  // Users
  users: {
    async findByEmail(email) {
      if (!email) return null;
      const cleanEmail = email.toLowerCase().trim();
      if (isMongoActive()) {
        try {
          return await User.findOne({ email: cleanEmail }).lean();
        } catch {}
      }
      return memUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
    },

    async findById(id) {
      if (isMongoActive()) {
        try {
          return await User.findOne({ $or: [{ id }, { _id: id }] }).lean();
        } catch {}
      }
      return memUsers.find(u => u.id === id) || null;
    },

    async create(userData) {
      if (isMongoActive()) {
        try {
          const doc = await User.create(userData);
          return doc.toObject ? doc.toObject() : doc;
        } catch {}
      }
      const newUser = {
        ...defaultUser,
        ...userData,
        id: userData.id || 'usr_' + Math.random().toString(36).substring(2, 8)
      };
      memUsers.push(newUser);
      return newUser;
    },

    async findByVerificationToken(token) {
      if (!token) return null;
      if (isMongoActive()) {
        try {
          return await User.findOne({ verificationToken: token }).lean();
        } catch {}
      }
      return memUsers.find(u => u.verificationToken === token) || null;
    },

    async update(id, updates) {
      if (isMongoActive()) {
        try {
          const query = mongoose.Types.ObjectId.isValid(id)
            ? { $or: [{ id }, { _id: id }] }
            : { id };
          return await User.findOneAndUpdate(
            query,
            { $set: updates },
            { new: true }
          ).lean();
        } catch {}
      }
      const index = memUsers.findIndex(u => u.id === id || u._id === id);
      if (index !== -1) {
        memUsers[index] = { ...memUsers[index], ...updates };
        return memUsers[index];
      }
      return null;
    },

    async updateByEmail(email, updates) {
      if (!email) return null;
      const cleanEmail = email.toLowerCase().trim();
      if (isMongoActive()) {
        try {
          return await User.findOneAndUpdate(
            { email: cleanEmail },
            { $set: updates },
            { new: true }
          ).lean();
        } catch {}
      }
      const index = memUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
      if (index !== -1) {
        memUsers[index] = { ...memUsers[index], ...updates };
        return memUsers[index];
      }
      return null;
    },

    async deleteByEmail(email) {
      if (!email) return false;
      const cleanEmail = email.toLowerCase().trim();
      if (isMongoActive()) {
        try {
          await User.deleteOne({ email: cleanEmail });
          return true;
        } catch {}
      }
      memUsers = memUsers.filter(u => u.email.toLowerCase() !== cleanEmail);
      return true;
    }
  },

  // Resumes
  resumes: {
    async findAll() {
      if (isMongoActive()) {
        try {
          const list = await Resume.find().sort({ createdAt: -1 });
          if (list && list.length > 0) return list;
        } catch {}
      }
      return [...memResumes];
    },

    async findById(id) {
      if (isMongoActive()) {
        try {
          const found = await Resume.findOne({ id });
          if (found) return found;
        } catch {}
      }
      return memResumes.find(r => r.id === id) || null;
    },

    async create(resumeData) {
      if (isMongoActive()) {
        try {
          return await Resume.create(resumeData);
        } catch {}
      }
      memResumes.unshift(resumeData);
      return resumeData;
    },

    async update(id, updates) {
      if (isMongoActive()) {
        try {
          return await Resume.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        } catch {}
      }
      const index = memResumes.findIndex(r => r.id === id);
      if (index !== -1) {
        memResumes[index] = { ...memResumes[index], ...updates };
        return memResumes[index];
      }
      return null;
    },

    async delete(id) {
      if (isMongoActive()) {
        try {
          await Resume.deleteOne({ id });
        } catch {}
      }
      memResumes = memResumes.filter(r => r.id !== id);
      delete memAnalyses[id];
      delete memAtsReports[id];
      delete memJobMatches[id];
      return true;
    }
  },

  // Analyses
  analyses: {
    async findByResumeId(resumeId) {
      if (isMongoActive()) {
        try {
          const found = await Analysis.findOne({ resumeId });
          if (found) return found;
        } catch {}
      }
      return memAnalyses[resumeId] || null;
    },

    async save(analysisData) {
      if (isMongoActive()) {
        try {
          return await Analysis.findOneAndUpdate(
            { resumeId: analysisData.resumeId },
            analysisData,
            { upsert: true, new: true }
          );
        } catch {}
      }
      memAnalyses[analysisData.resumeId] = analysisData;
      return analysisData;
    }
  },

  // ATS Reports
  atsReports: {
    async findByResumeId(resumeId) {
      if (isMongoActive()) {
        try {
          const found = await AtsReport.findOne({ resumeId });
          if (found) return found;
        } catch {}
      }
      return memAtsReports[resumeId] || null;
    },

    async save(reportData) {
      if (isMongoActive()) {
        try {
          return await AtsReport.findOneAndUpdate(
            { resumeId: reportData.resumeId },
            reportData,
            { upsert: true, new: true }
          );
        } catch {}
      }
      memAtsReports[reportData.resumeId] = reportData;
      return reportData;
    }
  },

  // Job Matches
  jobMatches: {
    async findByResumeId(resumeId) {
      if (isMongoActive()) {
        try {
          const found = await JobMatch.findOne({ resumeId });
          if (found) return found;
        } catch {}
      }
      return memJobMatches[resumeId] || null;
    },

    async save(matchData) {
      if (isMongoActive()) {
        try {
          return await JobMatch.findOneAndUpdate(
            { resumeId: matchData.resumeId },
            matchData,
            { upsert: true, new: true }
          );
        } catch {}
      }
      memJobMatches[matchData.resumeId] = matchData;
      return matchData;
    }
  },

  // Guest Sessions & One-Time Review Allowance
  guestSessions: {
    async create({ guestToken, ip = '', userAgent = '' }) {
      const newSession = {
        guestToken,
        reviewsUsed: 0,
        isReviewInProgress: false,
        completedResumeId: null,
        ip,
        userAgent,
        createdAt: new Date(),
        lastActiveAt: new Date()
      };
      if (isMongoActive()) {
        try {
          return await GuestSession.create(newSession);
        } catch {}
      }
      memGuestSessions[guestToken] = newSession;
      return newSession;
    },

    async findByToken(guestToken) {
      if (!guestToken) return null;
      if (isMongoActive()) {
        try {
          const found = await GuestSession.findOne({ guestToken });
          if (found) return found;
        } catch {}
      }
      return memGuestSessions[guestToken] || null;
    },

    async atomicStartReview(guestToken) {
      if (!guestToken) return { allowed: false, notFound: true };

      if (isMongoActive()) {
        try {
          const updated = await GuestSession.findOneAndUpdate(
            { guestToken, reviewsUsed: 0, isReviewInProgress: false },
            { isReviewInProgress: true, lastActiveAt: new Date() },
            { new: true }
          );
          if (updated) {
            return { allowed: true, session: updated };
          }
          // Either already used or lock held
          const current = await GuestSession.findOne({ guestToken });
          if (current && current.reviewsUsed >= 1) {
            return { allowed: false, limitReached: true, completedResumeId: current.completedResumeId };
          }
          if (current && current.isReviewInProgress) {
            return { allowed: false, inProgress: true };
          }
          return { allowed: false, notFound: true };
        } catch {}
      }

      // In-Memory Fallback
      let session = memGuestSessions[guestToken];
      if (!session) {
        return { allowed: false, notFound: true };
      }
      if (session.reviewsUsed >= 1) {
        return { allowed: false, limitReached: true, completedResumeId: session.completedResumeId };
      }
      if (session.isReviewInProgress) {
        return { allowed: false, inProgress: true };
      }
      session.isReviewInProgress = true;
      session.lastActiveAt = new Date();
      return { allowed: true, session };
    },

    async atomicCompleteReview(guestToken, resumeId) {
      if (!guestToken) return null;
      if (isMongoActive()) {
        try {
          return await GuestSession.findOneAndUpdate(
            { guestToken },
            {
              reviewsUsed: 1,
              isReviewInProgress: false,
              completedResumeId: resumeId,
              lastActiveAt: new Date()
            },
            { new: true }
          );
        } catch {}
      }

      const session = memGuestSessions[guestToken];
      if (session) {
        session.reviewsUsed = 1;
        session.isReviewInProgress = false;
        session.completedResumeId = resumeId;
        session.lastActiveAt = new Date();
        return session;
      }
      return null;
    },

    async releaseReviewLock(guestToken) {
      if (!guestToken) return;
      if (isMongoActive()) {
        try {
          await GuestSession.findOneAndUpdate(
            { guestToken, isReviewInProgress: true },
            { isReviewInProgress: false }
          );
        } catch {}
      }
      if (memGuestSessions[guestToken]) {
        memGuestSessions[guestToken].isReviewInProgress = false;
      }
    }
  }
};
