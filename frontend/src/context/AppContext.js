import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * AppContext — Global state for the AI Career Navigator.
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
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const savedId = localStorage.getItem('current_analysis_id');
      const token = localStorage.getItem('token');
      
      if (token && savedId && !flow.analysisId) {
        try {
          const { api } = await import('../api/client');
          const data = await api.getAnalysis(savedId);
          setFlow({
            analysisId: data.id,
            matchingSkills: data.matching_skills || [],
            missingSkills: data.missing_skills || [],
            similarityScore: data.similarity_score || null,
            jobTitle: data.job_title || null,
            skillLevels: data.skill_levels || {},
            timeline: data.timeline || null,
            roadmap: data.roadmap || null,
          });
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('current_analysis_id');
        }
      }
      setRestoring(false);
    };

    initSession();
  }, [flow.analysisId]); // Satisfy exhaustive-deps; condition inside prevents re-fetching

  // ── Auth actions ──────────────────────────────────────────────────────────

  const loginUser = useCallback((token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setAuth({ token, username });
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('current_analysis_id');
    setAuth({ token: null, username: null });
    setFlow(FLOW_INITIAL);
  }, []);

  // ── Flow actions ──────────────────────────────────────────────────────────

  const setAnalysisResult = useCallback((data) => {
    setFlow((prev) => ({
      ...prev,
      analysisId: data.analysis_id,
      matchingSkills: data.matching_skills || [],
      missingSkills: data.missing_skills || [],
      similarityScore: data.similarity_score || null,
      jobTitle: data.job_title || null,
      skillLevels: {},
      timeline: null,
      roadmap: null,
    }));
    localStorage.setItem('current_analysis_id', data.analysis_id);
  }, []);

  const setSkillLevels = useCallback((levels) => {
    setFlow((prev) => ({ ...prev, skillLevels: levels }));
  }, []);

  const setTimeline = useCallback((timeline) => {
    setFlow((prev) => ({ ...prev, timeline }));
  }, []);

  const setRoadmap = useCallback((roadmap) => {
    setFlow((prev) => ({ ...prev, roadmap }));
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    auth,
    flow,
    restoring,
    loginUser,
    logoutUser,
    setAnalysisResult,
    setSkillLevels,
    setTimeline,
    setRoadmap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
