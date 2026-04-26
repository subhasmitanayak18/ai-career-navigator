import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

const LEVELS = [
  { value: 'Beginner',     emoji: '🟢', color: '#10b981' },
  { value: 'Intermediate', emoji: '🟡', color: '#f59e0b' },
  { value: 'Advanced',     emoji: '🔴', color: '#ef4444' },
];

/**
 * SkillGapPage — Step 2: Rate proficiency level for each missing skill.
 */
const SkillGapPage = () => {
  const navigate = useNavigate();
  const { flow, setSkillLevels } = useApp();

  const { analysisId, matchingSkills, missingSkills, similarityScore, jobTitle } = flow;

  const [levels, setLevels]   = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const ratedCount = Object.keys(levels).length;
  const totalCount = missingSkills.length;
  const allRated   = ratedCount === totalCount;
  const scorePercent = similarityScore ? Math.round(parseFloat(similarityScore) * 100) : 0;

  const selectLevel = (skill, level) => {
    setLevels((prev) => ({ ...prev, [skill]: level }));
  };

  const handleContinue = async () => {
    if (!allRated) return;
    setError('');
    setLoading(true);
    try {
      await api.saveSkillLevels(analysisId, levels);
      setSkillLevels(levels);
      navigate('/timeline');
    } catch (err) {
      setError(err.message || 'Failed to save skill levels.');
    } finally {
      setLoading(false);
    }
  };

  if (!analysisId) {
    navigate('/upload');
    return null;
  }

  return (
    <div className="page">
      <ProgressBar currentStep={2} />

      {/* Analysis summary card */}
      <div className="card card-wide">
        <div className="summary-header">
          <div>
            <h2>🎯 Skill Gap Analysis</h2>
            {jobTitle && <p className="subtitle">Target role: <strong>{jobTitle}</strong></p>}
          </div>
          <div className="score-circle" style={{ '--score': scorePercent }}>
            <span className="score-number">{scorePercent}%</span>
            <span className="score-label">Match</span>
          </div>
        </div>

        {/* Matching skills */}
        {matchingSkills.length > 0 && (
          <div className="skills-section">
            <h3 className="skills-section-title">✅ Matching Skills ({matchingSkills.length})</h3>
            <div className="skills-tags">
              {matchingSkills.map((skill) => (
                <span key={skill} className="skill-tag skill-tag-match">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Missing skills rating */}
        {missingSkills.length > 0 ? (
          <div className="skills-section">
            <div className="skills-section-header">
              <h3 className="skills-section-title">
                ❌ Missing Skills — Rate Your Level
              </h3>
              <div className="rating-progress">
                <span className="rating-count">{ratedCount} / {totalCount} rated</span>
                <div className="rating-bar-track">
                  <div
                    className="rating-bar-fill"
                    style={{ width: `${(ratedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="skill-level-grid">
              {missingSkills.map((skill) => (
                <div
                  key={skill}
                  className={`skill-level-card ${levels[skill] ? 'skill-level-rated' : ''}`}
                >
                  <span className="skill-level-name">{skill}</span>
                  <div className="level-btns">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl.value}
                        id={`level-${skill}-${lvl.value}`}
                        type="button"
                        className={`level-btn ${levels[skill] === lvl.value ? 'level-btn-selected' : ''}`}
                        style={levels[skill] === lvl.value ? { borderColor: lvl.color, color: lvl.color, background: `${lvl.color}15` } : {}}
                        onClick={() => selectLevel(skill, lvl.value)}
                      >
                        {lvl.emoji} {lvl.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>No skill gaps detected!</h3>
            <p>Your resume already covers all the required skills for this role.</p>
          </div>
        )}

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <button
          id="btn-continue-timeline"
          className="btn btn-primary btn-full"
          disabled={!allRated || loading}
          onClick={handleContinue}
        >
          {loading ? (
            <span className="btn-loading"><span className="spinner-sm" /> Saving…</span>
          ) : (
            `Continue to Timeline →`
          )}
        </button>
      </div>
    </div>
  );
};

export default SkillGapPage;
