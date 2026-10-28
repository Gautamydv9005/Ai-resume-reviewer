import { dataStore } from '../utils/dataStore.js';
import { analyzeJobMatch, evaluateOnTheFly } from '../services/jobMatchEngine.js';

export const getJobMatchAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const jobData = req.body || null;

    if (jobData && (jobData.title || jobData.text)) {
      const resume = await dataStore.resumes.findById(resumeId);
      const text = resume?.extractedText || '';
      const calculated = analyzeJobMatch(text, jobData);
      
      const updatedMatch = {
        resumeId,
        ...calculated
      };
      await dataStore.jobMatches.save(updatedMatch);
      return res.json(updatedMatch);
    }

    const match = await dataStore.jobMatches.findByResumeId(resumeId);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Job match analysis not found' });
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch job match analysis', error: err.message });
  }
};

export const calculateMatchScore = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobText } = req.body;

    const resume = await dataStore.resumes.findById(resumeId);
    const resumeText = resume?.extractedText || '';

    const evaluation = evaluateOnTheFly(resumeText, jobText || '');
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to calculate job match score', error: err.message });
  }
};
