import { serviceRequest, delay } from './apiClient';
import { mockAnalysisResults } from '../mock/mockAnalysisData';

export const analysisService = {
  /**
   * Fetch full AI Analysis for a resume
   */
  async getResumeAnalysis(resumeId) {
    const remoteResponse = await serviceRequest('analysis', `/${resumeId}`);
    if (remoteResponse) return remoteResponse;

    await delay(500);
    // Return specific resume analysis or fallback to res_001
    return mockAnalysisResults[resumeId] || mockAnalysisResults.res_001;
  },

  /**
   * Re-run AI analysis with modified parameters
   */
  async triggerReanalysis(resumeId) {
    const remoteResponse = await serviceRequest('analysis', `/${resumeId}/reanalyze`, {
      method: 'POST'
    });
    if (remoteResponse) return remoteResponse;

    await delay(800);
    return mockAnalysisResults[resumeId] || mockAnalysisResults.res_001;
  }
};
