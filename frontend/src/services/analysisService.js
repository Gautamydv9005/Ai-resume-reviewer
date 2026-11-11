import { serviceRequest, delay, IS_MOCK_MODE } from './apiClient';
import { mockAnalysisResults } from '../mock/mockAnalysisData';

export const analysisService = {
  /**
   * Fetch full AI Analysis for a resume
   */
  async getResumeAnalysis(resumeId) {
    const remoteResponse = await serviceRequest('analysis', `/${resumeId}`);
    if (remoteResponse) return remoteResponse;

    if (!IS_MOCK_MODE) {
      return null;
    }

    await delay(300);
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

    if (!IS_MOCK_MODE) {
      throw new Error('Reanalysis failed: Unable to connect to analysis service.');
    }

    await delay(400);
    return mockAnalysisResults[resumeId] || mockAnalysisResults.res_001;
  }
};
