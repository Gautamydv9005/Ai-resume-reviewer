import { serviceRequest, delay } from './apiClient';
import { sampleResumes } from '../mock/mockResumes';

export const resumeService = {
  /**
   * Upload resume file (PDF/DOCX) & optional job description
   * Supports progress callback for smooth frontend progress bar animation
   */
  async uploadResume(file, jobDescription = null, onProgress = () => {}) {
    // 1. Check if remote Resume Service is configured
    const formData = new FormData();
    if (file) {
      formData.append('resume', file);
    }
    if (jobDescription) {
      formData.append('jobDescription', JSON.stringify(jobDescription));
    }

    // Progress simulation for interactive UX
    const steps = [15, 38, 65, 88, 100];
    for (const step of steps) {
      onProgress(step);
      await delay(250);
    }

    // Try microservice if available
    const remoteResponse = await serviceRequest('resume', '/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set multipart boundary
    });

    if (remoteResponse) {
      return remoteResponse;
    }

    if (import.meta.env.VITE_USE_MOCK_DATA === 'false') {
      throw new Error('Upload failed: Unable to connect to backend resume processing service.');
    }

    // Fallback Mock response
    const newResumeId = 'res_' + Math.random().toString(36).substring(2, 9);
    const mockCreated = {
      id: newResumeId,
      fileName: file ? file.name : 'Uploaded_Resume.pdf',
      fileSize: file ? `${(file.size / 1024).toFixed(1)} KB` : '425.0 KB',
      fileType: file ? file.type : 'application/pdf',
      uploadedAt: new Date().toISOString(),
      targetJobTitle: jobDescription?.title || 'Senior Software Engineer',
      targetCompany: jobDescription?.company || 'Target Company',
      status: 'Completed',
      overallScore: 84,
      atsScore: 89,
      jobMatchScore: jobDescription?.title ? 78 : null
    };

    return mockCreated;
  },

  /**
   * Get resume metadata by ID
   */
  async getResume(resumeId) {
    const remoteResponse = await serviceRequest('resume', `/${resumeId}`);
    if (remoteResponse) return remoteResponse;

    await delay(300);
    const found = sampleResumes.find(r => r.id === resumeId);
    return found || sampleResumes[0];
  },

  /**
   * Delete resume
   */
  async deleteResume(resumeId) {
    const remoteResponse = await serviceRequest('resume', `/${resumeId}`, {
      method: 'DELETE'
    });
    if (remoteResponse) return remoteResponse;

    await delay(400);
    return { success: true, id: resumeId };
  }
};
