import { serviceRequest, delay } from './apiClient';
import { mockJobMatchResults } from '../mock/mockJobMatchData';

export const jobMatchService = {
  /**
   * Fetch Job Match Analysis
   */
  async getJobMatchAnalysis(resumeId, jobData = null) {
    const remoteResponse = await serviceRequest('jobMatch', `/${resumeId}`, {
      method: jobData ? 'POST' : 'GET',
      ...(jobData ? { body: JSON.stringify(jobData) } : {})
    });
    if (remoteResponse) return remoteResponse;

    await delay(500);
    return mockJobMatchResults[resumeId] || mockJobMatchResults.res_001;
  },

  /**
   * Evaluate a new Job Description against a resume on the fly
   */
  async calculateMatchScore(resumeId, jobText) {
    const remoteResponse = await serviceRequest('jobMatch', `/${resumeId}/match`, {
      method: 'POST',
      body: JSON.stringify({ jobText })
    });
    if (remoteResponse) return remoteResponse;

    await delay(700);
    return {
      matchScore: 81,
      skillsIdentified: ['React', 'TypeScript', 'Node.js', 'System Design'],
      missingSkills: ['Kubernetes', 'Docker']
    };
  }
};
