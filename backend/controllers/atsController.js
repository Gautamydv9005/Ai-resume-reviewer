import { dataStore } from '../utils/dataStore.js';

export const getAtsAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const report = await dataStore.atsReports.findByResumeId(resumeId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'ATS report not found' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch ATS analysis', error: err.message });
  }
};

export const getAtsKeywords = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const report = await dataStore.atsReports.findByResumeId(resumeId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'ATS report not found' });
    }

    res.json({
      matched: report.matchedKeywords || [],
      missing: report.missingKeywords || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch ATS keywords', error: err.message });
  }
};
