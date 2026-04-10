/**
 * API Client for AI Career Navigator
 * All requests go through this module.
 * Bearer token is automatically attached from localStorage.
 */

// Dynamic backend URL for production vs local
// Render environment variables will inject just the domain hostname.
const _RAW_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const BASE_URL = `${_RAW_URL.replace(/\/+$/, '')}/api`;

/** Read the JWT token stored after login */
const getToken = () => localStorage.getItem('token');

/** Build standard headers, injecting Authorization if a token exists */
const buildHeaders = (isFormData = false) => {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

/**
 * Core fetch wrapper.
 * Always returns parsed JSON. Throws an Error with the server's
 * `detail` message on non-2xx responses.
 */
const request = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.detail || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
};

export const api = {
  /**
   * Register a new user account.
   * @returns { access_token, token_type, username }
   */
  signup: (username, email, password) =>
    request('/auth/signup/', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ username, email, password }),
    }),

  /**
   * Authenticate with username + password.
   * @returns { access_token, token_type, username }
   */
  login: (username, password) =>
    request('/auth/login/', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ username, password }),
    }),

  /**
   * Fetch the authenticated user's last 10 analyses.
   * @returns Array of past analysis summaries
   */
  getDashboard: () =>
    request('/dashboard/', {
      method: 'GET',
      headers: buildHeaders(),
    }),

  /**
   * Submit FormData containing resume (file or text) + job description.
   * Uses multipart form data so the PDF file can be sent.
   * @param {FormData} formData
   * @returns Analysis result with matching/missing skills
   */
  analyze: (formData) =>
    request('/analyze/', {
      method: 'POST',
      headers: buildHeaders(true), // no Content-Type; browser sets multipart boundary
      body: formData,
    }),

  /**
   * Save proficiency levels for each missing skill.
   * @param {number} analysisId
   * @param {Object} skillLevels  e.g. { "Python": "Beginner", "Docker": "Intermediate" }
   */
  saveSkillLevels: (analysisId, skillLevels) =>
    request('/skill-level/', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ analysis_id: analysisId, skill_levels: skillLevels }),
    }),

  /**
   * Save the chosen learning timeline for an analysis.
   * @param {number} analysisId
   * @param {string} timeline  "1 Month" | "3 Months" | "6 Months"
   */
  saveTimeline: (analysisId, timeline) =>
    request('/timeline/', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ analysis_id: analysisId, timeline }),
    }),

  /**
   * Generate the AI-powered roadmap for a completed analysis.
   * @param {number} analysisId
   * @returns Full roadmap object with phases, resources, and metrics
   */
  generateRoadmap: (analysisId) =>
    request('/roadmap/', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ analysis_id: analysisId }),
    }),

  /** Health check */
  health: () =>
    request('/health/', {
      method: 'GET',
      headers: buildHeaders(),
    }),
};
