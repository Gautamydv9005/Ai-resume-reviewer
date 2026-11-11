import { serviceRequest, delay, IS_MOCK_MODE } from './apiClient';
import { mockAtsResults } from '../mock/mockAtsData';

export const atsService = {
  /**
   * Fetch ATS Compatibility & Keyword Analysis
   */
  async getAtsAnalysis(resumeId) {
    const remoteResponse = await serviceRequest('ats', `/${resumeId}`);
    if (remoteResponse) return remoteResponse;

    if (!IS_MOCK_MODE) {
      return null;
    }

    await delay(300);
    return mockAtsResults[resumeId] || mockAtsResults.res_001;
  },

  /**
   * Fetch Keyword Breakdown
   */
  async getAtsKeywords(resumeId) {
    const remoteResponse = await serviceRequest('ats', `/${resumeId}/keywords`);
    if (remoteResponse) return remoteResponse;

    if (!IS_MOCK_MODE) {
      return { matched: [], missing: [] };
    }

    await delay(250);
    const data = mockAtsResults[resumeId] || mockAtsResults.res_001;
    return {
      matched: data.matchedKeywords,
      missing: data.missingKeywords
    };
  }
};
