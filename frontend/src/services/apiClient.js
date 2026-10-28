/**
 * Centralized API Client & Microservices Connector
 * 
 * Configures the connection to the deployed backend on Render:
 * https://ai-resume-reviewer-jjdn.onrender.com
 * 
 * Supports unified VITE_API_BASE_URL as well as individual service endpoints.
 * Includes Bearer token authentication, guest sessions, Render free-tier cold-start handling,
 * and intelligent error parsing.
 */

// Production Deployed Backend URL on Render
const DEFAULT_BACKEND_URL = 'https://ai-resume-reviewer-jjdn.onrender.com';

// Sanitize configured base URL (remove trailing slashes)
const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, '');
export const API_BASE_URL = RAW_API_BASE;

// Compute /api subpath
const API_BASE = RAW_API_BASE.endsWith('/api') ? RAW_API_BASE : `${RAW_API_BASE}/api`;

export const SERVICE_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL || `${API_BASE}/auth`,
  resume: import.meta.env.VITE_RESUME_SERVICE_URL || `${API_BASE}/resumes`,
  analysis: import.meta.env.VITE_ANALYSIS_SERVICE_URL || `${API_BASE}/analysis`,
  ats: import.meta.env.VITE_ATS_SERVICE_URL || `${API_BASE}/ats`,
  jobMatch: import.meta.env.VITE_JOB_MATCH_SERVICE_URL || `${API_BASE}/job-match`,
  user: import.meta.env.VITE_USER_SERVICE_URL || `${API_BASE}/users`
};

// Mock mode is ONLY active if explicitly forced via VITE_USE_MOCK_DATA=true
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK_DATA === 'true';

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
 * Check backend health status (useful for cold-start wake-up check)
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Backend Health Check Failed]:', err.message);
  }
  return null;
}

/**
 * Universal fetch wrapper for microservices and API endpoints
 */
export async function serviceRequest(serviceKey, endpoint, options = {}) {
  const baseUrl = SERVICE_URLS[serviceKey];

  if (!baseUrl && !IS_MOCK_MODE) {
    throw new Error(`Endpoint for service "${serviceKey}" is not configured.`);
  }

  // If mock mode is explicitly forced, bypass network (unless auth)
  if (IS_MOCK_MODE && serviceKey !== 'auth') {
    return null;
  }

  const token = getAuthToken();
  const guestToken = getGuestToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : (guestToken ? { 'x-guest-token': guestToken } : {})),
    ...options.headers
  };

  // Render free-tier cold-start accommodation: 75s timeout for AI/upload, 45s for standard calls
  const timeoutMs = options.timeoutMs || (serviceKey === 'resume' || serviceKey === 'analysis' ? 75000 : 45000);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      credentials: 'include',
      signal: controller.signal,
      ...options,
      headers
    });

    clearTimeout(timeoutId);

    // If unauthorized, clean up expired token
    if (response.status === 401 && token) {
      localStorage.removeItem('resumate_auth_token');
    }

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
    clearTimeout(timeoutId);

    // HTTP responses with status codes (400, 401, 403, 404, 429, 500)
    if (error.status) {
      throw error;
    }

    // AbortController timeout (often Render waking up from spin-down)
    if (error.name === 'AbortError') {
      throw new Error(
        `Request to ${serviceKey} service timed out. The backend server on Render may be waking up from sleep (cold start). Please wait about 30 seconds and try again.`
      );
    }

    // Network error / DNS / Failed to fetch
    const isNetworkError =
      error.name === 'TypeError' ||
      error.message?.toLowerCase().includes('failed to fetch') ||
      error.message?.toLowerCase().includes('networkerror') ||
      error.message?.toLowerCase().includes('load failed');

    if (isNetworkError) {
      const helpfulMsg = `Cannot connect to backend service (${baseUrl}). The server on Render may be waking up from cold sleep. Please wait ~30 seconds and try again.`;

      // Always throw on auth and mutations
      if (serviceKey === 'auth' || (options.method && options.method !== 'GET')) {
        throw new Error(helpfulMsg);
      }

      console.warn(`[API Connection Notice: ${serviceKey}] ${helpfulMsg} Falling back gracefully.`);
      return null;
    }

    throw error;
  }
}

/**
 * Artificial network latency simulation for smooth mock animations if mock mode is on
 */
export const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));
