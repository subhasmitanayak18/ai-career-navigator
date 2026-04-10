import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * AppContext — Global state for the AI Career Navigator.
 *
 * State shape:
 *   auth:  { token: string|null, username: string|null }
 *   flow:  { analysisId, matchingSkills, missingSkills, similarityScore,
 *             skillLevels, timeline, roadmap }
 *
 * Actions:
 *   loginUser(token, username)
 *   logoutUser()
 *   setAnalysisResult(data)
 *   setSkillLevels(levels)
 *   setTimeline(timeline)
 *   setRoadmap(roadmap)
 */

const AppContext = createContext(null);

const FLOW_INITIAL = {
  analysisId: null,
  matchingSkills: [],
  missingSkills: [],
  similarityScore: null,
  jobTitle: null,
  skillLevels: {},
  timeline: null,
  roadmap: null,
};

export const AppProvider = ({ children }) => {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
  }));

  // ── Analysis flow state ───────────────────────────────────────────────────
  const [flow, setFlow] = useState(FLOW_INITIAL);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const loginUser = useCallback((token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setAuth({ token, username });
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth({ token: null, username: null });
    setFlow(FLOW_INITIAL);
  }, []);

  // ── Flow actions ──────────────────────────────────────────────────────────

  /**
   * Save data returned from /api/analyze/
   * @param {{ analysis_id, matching_skills, missing_skills, similarity_score, job_title }} data
   */
  const setAnalysisResult = useCallback((data) => {
    setFlow((prev) => ({
      ...prev,
      analysisId: data.analysis_id,
      matchingSkills: data.matching_skills || [],
      missingSkills: data.missing_skills || [],
      similarityScore: data.similarity_score || null,
      jobTitle: data.job_title || null,
      // Reset downstream state when a new analysis starts
      skillLevels: {},
      timeline: null,
      roadmap: null,
    }));
  }, []);

  /**
   * Save skill proficiency levels selected by the user.
   * @param {Object} levels  e.g. { "Python": "Beginner" }
   */
  const setSkillLevels = useCallback((levels) => {
    setFlow((prev) => ({ ...prev, skillLevels: levels }));
  }, []);

  /**
   * Save the chosen learning timeline.
   * @param {string} timeline  "1 Month" | "3 Months" | "6 Months"
   */
  const setTimeline = useCallback((timeline) => {
    setFlow((prev) => ({ ...prev, timeline }));
  }, []);

  /**
   * Save the generated roadmap returned from /api/roadmap/
   * @param {Object} roadmap
   */
  const setRoadmap = useCallback((roadmap) => {
    setFlow((prev) => ({ ...prev, roadmap }));
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    auth,
    flow,
    loginUser,
    logoutUser,
    setAnalysisResult,
    setSkillLevels,
    setTimeline,
    setRoadmap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Custom hook for consuming AppContext.
 * Throws if used outside of AppProvider.
 */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
