import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, default: 'usr_88291' },
    fileName: { type: String, required: true },
    fileSize: { type: String, default: '450 KB' },
    fileType: { type: String, default: 'application/pdf' },
    filePath: { type: String },
    extractedText: { type: String, default: '' },
    uploadedAt: { type: String, default: () => new Date().toISOString() },
    date: { type: String, default: 'Just now' },
    rawDate: { type: String, default: () => new Date().toISOString() },
    targetJobTitle: { type: String, default: 'Senior Software Engineer' },
    targetCompany: { type: String, default: 'Target Company' },
    targetJobText: { type: String, default: '' },
    requiredSkills: { type: [String], default: [] },
    status: { type: String, enum: ['Completed', 'Processing', 'Failed'], default: 'Completed' },
    overallScore: { type: Number, default: 80 },
    atsScore: { type: Number, default: 85 },
    jobMatchScore: { type: Number, default: null },
    skillsScore: { type: Number, default: 88 },
    experienceScore: { type: Number, default: 82 },
    notes: { type: String, default: '' }
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

export const Resume = mongoose.model('Resume', ResumeSchema);
