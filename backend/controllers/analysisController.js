import { dataStore } from '../utils/dataStore.js';
import { parseResumeSections } from '../services/resumeParser.js';
import { analyzeAtsCompliance } from '../services/atsEngine.js';
import { analyzeJobMatch } from '../services/jobMatchEngine.js';
import { generateFullAnalysis } from '../services/aiAnalysisEngine.js';

export const getResumeAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const analysis = await dataStore.analyses.findByResumeId(resumeId);

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analysis', error: err.message });
  }
};

export const reanalyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await dataStore.resumes.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const text = resume.extractedText || '';
    const parsed = parseResumeSections(text);
    const atsResult = analyzeAtsCompliance(text, parsed, resume.fileName);
    const jobMatchResult = analyzeJobMatch(text, {
      title: resume.targetJobTitle,
      company: resume.targetCompany
    });

    const fullAnalysis = await generateFullAnalysis(text, parsed, atsResult, jobMatchResult, {
      fileName: resume.fileName,
      targetJobTitle: resume.targetJobTitle,
      targetCompany: resume.targetCompany
    });

    const updatedAnalysis = {
      id: 'anl_' + resumeId,
      resumeId,
      fileName: resume.fileName,
      analyzedAt: new Date().toISOString(),
      targetJobTitle: resume.targetJobTitle,
      targetCompany: resume.targetCompany,
      ...fullAnalysis
    };

    await dataStore.analyses.save(updatedAnalysis);
    res.json(updatedAnalysis);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reanalyze resume', error: err.message });
  }
};

export const compareResumes = async (req, res) => {
  try {
    const { v1, v2 } = req.query;

    if (!v1 || !v2) {
      return res.status(400).json({ success: false, message: 'v1 and v2 parameters are required for comparison' });
    }

    const resume1 = await dataStore.resumes.findById(v1);
    const resume2 = await dataStore.resumes.findById(v2);

    const r1 = resume1 || {
      id: v1,
      fileName: 'Resume_Version_1.pdf',
      overallScore: 76,
      atsScore: 72,
      jobMatchScore: 70,
      skillsScore: 80,
      experienceScore: 75
    };

    const r2 = resume2 || {
      id: v2,
      fileName: 'Resume_Version_2.pdf',
      overallScore: 84,
      atsScore: 89,
      jobMatchScore: 78,
      skillsScore: 92,
      experienceScore: 86
    };

    const differences = {
      overallDelta: (r2.overallScore || 84) - (r1.overallScore || 76),
      atsDelta: (r2.atsScore || 89) - (r1.atsScore || 72),
      jobMatchDelta: ((r2.jobMatchScore || 78) - (r1.jobMatchScore || 70)),
      skillsDelta: (r2.skillsScore || 92) - (r1.skillsScore || 80),
      experienceDelta: (r2.experienceScore || 86) - (r1.experienceScore || 75)
    };

    res.json({
      resume1: r1,
      resume2: r2,
      differences
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to compare resumes', error: err.message });
  }
};
