import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import RoadmapPhase from '../components/RoadmapPhase';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

/**
 * RoadmapPage — Step 4: Display the AI-generated learning roadmap.
 */
const RoadmapPage = () => {
  const navigate = useNavigate();
  const { flow, setRoadmap } = useApp();
  const { analysisId, similarityScore } = flow;

  const [roadmap, setLocalRoadmap] = useState(null);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState('');

  useEffect(() => {
    if (!analysisId) {
      navigate('/upload');
      return;
    }

    const fetchRoadmap = async () => {
      try {
        const data = await api.generateRoadmap(analysisId);
        setLocalRoadmap(data);
        setRoadmap(data);
      } catch (err) {
        setError(err.message || 'Failed to generate roadmap. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [analysisId]); // eslint-disable-line

  const handlePrint = () => window.print();

  const scorePercent = similarityScore
    ? Math.round(parseFloat(similarityScore) * 100)
    : 0;

  return (
    <div className="page">
      <ProgressBar currentStep={4} />

      {loading && (
        <div className="loading-fullpage">
          <div className="spinner spinner-lg" />
          <h3>Generating your personalized roadmap…</h3>
          <p className="subtitle">BERT is crafting your learning path. This may take a moment.</p>
        </div>
      )}

      {error && (
        <div className="card card-wide">
          <div className="alert alert-error">⚠ {error}</div>
          <button className="btn btn-outline" onClick={() => navigate('/timeline')}>
            ← Back to Timeline
          </button>
        </div>
      )}

      {!loading && !error && roadmap && (
        <>
          {/* Header */}
          <div className="roadmap-header">
            <div>
              <h1 className="roadmap-title">
                🗺 Your Career Roadmap
              </h1>
              {roadmap.job_title && (
                <p className="subtitle">Target Role: <strong>{roadmap.job_title}</strong></p>
              )}
            </div>
            <div className="roadmap-actions">
              <button id="btn-back-dashboard" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                ← Dashboard
              </button>
              <button id="btn-print" className="btn btn-primary" onClick={handlePrint}>
                🖨 Print Roadmap
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-grid">
            <div className="stat-card stat-card-purple">
              <div className="stat-value">{roadmap.skill_coverage}%</div>
              <div className="stat-label">Skill Coverage</div>
            </div>
            <div className="stat-card stat-card-blue">
              <div className="stat-value">{roadmap.confidence_score}%</div>
              <div className="stat-label">Confidence Score</div>
            </div>
            <div className="stat-card stat-card-green">
              <div className="stat-value">{scorePercent}%</div>
              <div className="stat-label">Resume Match</div>
            </div>
            <div className="stat-card stat-card-amber">
              <div className="stat-value">{roadmap.total_weeks}</div>
              <div className="stat-label">Learning Weeks</div>
            </div>
          </div>

          {/* Priority skills */}
          {roadmap.priority_skills && roadmap.priority_skills.length > 0 && (
            <div className="card card-wide priority-section">
              <h3>🏆 Priority Skills to Master</h3>
              <div className="priority-skills">
                {roadmap.priority_skills.map((skill, i) => (
                  <span key={skill} className="priority-badge">
                    <span className="priority-rank">#{i + 1}</span> {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap phases */}
          <div className="card card-wide">
            <h2>📅 Week-by-Week Plan ({roadmap.timeline})</h2>
            <p className="subtitle">Click each phase to expand tasks and resources.</p>

            {roadmap.phases && roadmap.phases.length > 0 ? (
              <div className="phases-list">
                {roadmap.phases.map((phase, i) => (
                  <RoadmapPhase key={i} phase={phase} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No phases generated. This may happen when no skill gaps were found.</p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="roadmap-footer">
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              ✦ New Analysis
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RoadmapPage;
