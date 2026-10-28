import { serviceRequest, delay } from './apiClient';
import { mockAtsResults } from '../mock/mockAtsData';

export const atsService = {
  /**
   * Fetch ATS Compatibility & Keyword Analysis
   */
  async getAtsAnalysis(resumeId) {
    const remoteResponse = await serviceRequest('ats', `/${resumeId}`);
    if (remoteResponse) return remoteResponse;

    await delay(450);
    return mockAtsResults[resumeId] || mockAtsResults.res_001;
  },

  /**
   * Fetch Keyword Breakdown
   */
  async getAtsKeywords(resumeId) {
    const remoteResponse = await serviceRequest('ats', `/${resumeId}/keywords`);
    if (remoteResponse) return remoteResponse;

    await delay(350);
    const data = mockAtsResults[resumeId] || mockAtsResults.res_001;
    return {
      matched: data.matchedKeywords,
      missing: data.missingKeywords
    };
  }
};
