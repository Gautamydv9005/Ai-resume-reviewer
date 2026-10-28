import mongoose from 'mongoose';

const MatchedKeywordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  count: { type: Number, default: 1 }
}, { _id: false });

const MissingKeywordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  importance: { type: String, default: 'High' },
  tip: { type: String, default: '' }
}, { _id: false });

const FormattingAuditSchema = new mongoose.Schema({
  rule: { type: String, required: true },
  status: { type: String, enum: ['passed', 'warning', 'failed'], default: 'passed' },
  details: { type: String, required: true }
}, { _id: false });

const SectionDetectionSchema = new mongoose.Schema({
  section: { type: String, required: true },
  detected: { type: Boolean, default: true },
  confidence: { type: String, default: '100%' }
}, { _id: false });

const AtsReportSchema = new mongoose.Schema(
  {
    resumeId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    atsScore: { type: Number, default: 85 },
    atsStatus: { type: String, default: 'Pass Candidate Screening' },
    matchPercentage: { type: Number, default: 85 },
    totalKeywordsDetected: { type: Number, default: 35 },
    matchedKeywordsCount: { type: Number, default: 30 },
    missingKeywordsCount: { type: Number, default: 5 },
    matchedKeywords: { type: [MatchedKeywordSchema], default: [] },
    missingKeywords: { type: [MissingKeywordSchema], default: [] },
    formattingAudit: { type: [FormattingAuditSchema], default: [] },
    sectionDetection: { type: [SectionDetectionSchema], default: [] }
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

export const AtsReport = mongoose.model('AtsReport', AtsReportSchema);
