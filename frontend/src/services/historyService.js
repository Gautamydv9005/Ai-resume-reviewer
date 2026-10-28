import { serviceRequest, delay } from './apiClient';
import { initialResumeHistory } from '../mock/mockHistoryData';

// Local in-memory state persistence for dynamic frontend demonstration
let historyCache = [...initialResumeHistory];

export const historyService = {
  /**
   * Fetch user's previous resume analyses
   */
  async getResumeHistory() {
    const remoteResponse = await serviceRequest('resume', '/history');
    if (remoteResponse) return remoteResponse;

    await delay(350);
    return [...historyCache];
  },

  /**
   * Rename an analyzed resume record
   */
  async renameResume(id, newName) {
    const remoteResponse = await serviceRequest('resume', `/${id}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ fileName: newName })
    });
    if (remoteResponse) return remoteResponse;

    await delay(250);
    historyCache = historyCache.map(item => 
      item.id === id ? { ...item, fileName: newName } : item
    );
    return { success: true, id, fileName: newName };
  },

  /**
   * Delete an analyzed resume from history
   */
  async deleteResumeHistory(id) {
    const remoteResponse = await serviceRequest('resume', `/${id}`, {
      method: 'DELETE'
    });
    if (remoteResponse) return remoteResponse;

    await delay(300);
    historyCache = historyCache.filter(item => item.id !== id);
    return { success: true, id };
  },

  /**
   * Compare two resume versions side-by-side
   */
  async compareResumes(id1, id2) {
    const remoteResponse = await serviceRequest('analysis', `/compare?v1=${id1}&v2=${id2}`);
    if (remoteResponse) return remoteResponse;

    await delay(400);
    const resume1 = historyCache.find(item => item.id === id1) || historyCache[1];
    const resume2 = historyCache.find(item => item.id === id2) || historyCache[0];

    return {
      resume1,
      resume2,
      differences: {
        overallDelta: (resume2.overallScore || 84) - (resume1.overallScore || 76),
        atsDelta: (resume2.atsScore || 89) - (resume1.atsScore || 72),
        jobMatchDelta: (resume2.jobMatchScore || 78) - (resume1.jobMatchScore || 70),
        skillsDelta: (resume2.skillsScore || 92) - (resume1.skillsScore || 80),
        experienceDelta: (resume2.experienceScore || 86) - (resume1.experienceScore || 75)
      }
    };
  }
};
