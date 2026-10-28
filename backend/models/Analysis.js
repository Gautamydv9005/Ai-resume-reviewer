import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, required: true },
  status: { type: String, required: true },
  items: { type: [String], default: [] },
  suggestion: { type: String, default: '' }
}, { _id: false });

const FeedbackItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  impact: { type: String, default: 'Medium Impact' },
  action: { type: String },
  priority: { type: String }
}, { _id: false });

const ImprovementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  section: { type: String, required: true },
  sectionTitle: { type: String, required: true },
  original: { type: String, required: true },
  suggested: { type: String, required: true },
  rationale: { type: String, required: true }
}, { _id: false });

const AnalysisSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    resumeId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    analyzedAt: { type: String, default: () => new Date().toISOString() },
    targetJobTitle: { type: String, default: 'Senior Software Engineer' },
    targetCompany: { type: String, default: 'Target Company' },
    scores: {
      overall: { type: Number, default: 80 },
      ats: { type: Number, default: 85 },
      jobMatch: { type: Number, default: 75 },
      readability: { type: Number, default: 90 },
      impact: { type: Number, default: 80 }
    },
    summaryVerdict: {
      tier: { type: String, default: 'Strong Candidate' },
      badge: { type: String, default: 'Top 10% ATS Compatible' },
      headline: { type: String, default: '' },
      nextStepAdvice: { type: String, default: '' }
    },
    sections: { type: [SectionSchema], default: [] },
    feedback: {
      strengths: { type: [FeedbackItemSchema], default: [] },
      weaknesses: { type: [FeedbackItemSchema], default: [] },
      suggestions: { type: [FeedbackItemSchema], default: [] }
    },
    improvements: { type: [ImprovementSchema], default: [] }
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

export const Analysis = mongoose.model('Analysis', AnalysisSchema);
