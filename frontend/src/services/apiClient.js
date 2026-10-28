/**
 * Centralized API Client & Microservices Connector
 * 
 * Supports independent microservice endpoints configured via environment variables.
 * Gracefully delegates to mock data if microservices are offline or unset.
 */

export const SERVICE_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL || '',
  resume: import.meta.env.VITE_RESUME_SERVICE_URL || '',
  analysis: import.meta.env.VITE_ANALYSIS_SERVICE_URL || '',
  ats: import.meta.env.VITE_ATS_SERVICE_URL || '',
  jobMatch: import.meta.env.VITE_JOB_MATCH_SERVICE_URL || '',
  user: import.meta.env.VITE_USER_SERVICE_URL || ''
};

export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

/**
 * Helper to get authorization token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('resumate_auth_token');
};

export const getGuestToken = () => {
  return localStorage.getItem('resumate_guest_token');
};

/**
 * Universal fetch wrapper for microservices
 */
export async function serviceRequest(serviceKey, endpoint, options = {}) {
  const baseUrl = SERVICE_URLS[serviceKey];

  // If no baseUrl is provided or mock mode is forced, let caller fallback to mock
  // EXCEPT for auth — auth must always use the real backend, never mock
  if (!baseUrl || IS_MOCK_MODE) {
    if (serviceKey === 'auth') {
      if (!baseUrl) {
        throw new Error('Backend server is not configured. Please ensure the backend is running at http://localhost:5000');
      }
      // Even in mock mode, auth must go through real backend — fall through
    } else {
      return null;
    }
  }

  const token = getAuthToken();
  const guestToken = getGuestToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : (guestToken ? { 'x-guest-token': guestToken } : {})),
    ...options.headers
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.message || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      err.limitReached = errorData.limitReached;
      err.completedResumeId = errorData.completedResumeId;
      err.isUnverified = errorData.isUnverified;
      err.email = errorData.email;
      throw err;
    }

    return await response.json();
  } catch (error) {
    // If backend explicitly returned an HTTP error (400, 401, 403, 404, 413, 500), always propagate!
    if (error.status) {
      throw error;
    }

    // For auth endpoints, always propagate errors — never silently fall back to mock
    if (serviceKey === 'auth') {
      if (
        error.name === 'TypeError' ||
        error.message?.toLowerCase().includes('failed to fetch') ||
        error.message?.toLowerCase().includes('networkerror')
      ) {
        throw new Error(
          `Cannot connect to the backend server (${baseUrl || 'http://localhost:5000'}). Please make sure the backend is running with 'npm run backend' or 'npm run dev'.`
        );
      }
      throw error;
    }

    // For mutating operations (POST, PATCH, DELETE) when not in mock mode, throw connection error
    if (!IS_MOCK_MODE && options.method && options.method !== 'GET') {
      throw new Error(`Cannot connect to ${serviceKey} service at ${baseUrl}. Please ensure the backend server is running.`);
    }

    console.warn(`[Microservice: ${serviceKey}] Call to ${endpoint} failed, falling back to mock:`, error.message);
    return null;
  }
}

/**
 * Artificial network latency simulation for realistic UI states (loading, spinners, progress)
 */
export const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));
