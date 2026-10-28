import mongoose from 'mongoose';

const RoleFitSchema = new mongoose.Schema({
  area: { type: String, required: true },
  score: { type: Number, required: true },
  status: { type: String, required: true }
}, { _id: false });

const MatchingSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, default: 'Advanced' },
  relevance: { type: String, default: 'Core Requirement' }
}, { _id: false });

const SkillToImproveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priority: { type: String, default: 'High' },
  reason: { type: String, default: '' }
}, { _id: false });

const RelevantExperienceSchema = new mongoose.Schema({
  aspect: { type: String, required: true },
  required: { type: String, required: true },
  found: { type: String, required: true },
  match: { type: Boolean, default: true }
}, { _id: false });

const RecommendedSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, default: '1-2 weeks' },
  impact: { type: String, default: '+5% Job Match' }
}, { _id: false });

const JobMatchSchema = new mongoose.Schema(
  {
    resumeId: { type: String, required: true, unique: true },
    hasJobMatch: { type: Boolean, default: true },
    jobTitle: { type: String, default: 'Senior Software Engineer' },
    company: { type: String, default: 'Target Employer' },
    experienceLevel: { type: String, default: null },
    jobMatchScore: { type: Number, default: null },
    matchVerdict: { type: String, default: 'High Probability Match for Technical Screen' },
    summary: { type: String, default: '' },
    roleFitBreakdown: { type: [RoleFitSchema], default: [] },
    matchingSkills: { type: [MatchingSkillSchema], default: [] },
    skillsToImprove: { type: [SkillToImproveSchema], default: [] },
    relevantExperienceAnalysis: { type: [RelevantExperienceSchema], default: [] },
    recommendedSkillsToLearn: { type: [RecommendedSkillSchema], default: [] }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const JobMatch = mongoose.model('JobMatch', JobMatchSchema);
