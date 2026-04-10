import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

const TIMELINE_OPTIONS = [
  {
    value: '1 Month',
    icon: '⚡',
    weeks: 4,
    label: 'Intensive Sprint',
    description: 'Fast-track learning for candidates who need to upskill quickly.',
    color: '#ef4444',
  },
  {
    value: '3 Months',
    icon: '🎯',
    weeks: 12,
    label: 'Balanced Approach',
    description: 'The recommended path — steady progress with time to practice.',
    color: '#6366f1',
    recommended: true,
  },
  {
    value: '6 Months',
    icon: '🌱',
    weeks: 24,
    label: 'Deep Dive',
    description: 'Comprehensive mastery with time for projects and side-learning.',
    color: '#10b981',
  },
];

/**
 * TimelinePage — Step 3: Pick a learning timeline for the roadmap.
 */
const TimelinePage = () => {
  const navigate = useNavigate();
  const { flow, setTimeline } = useApp();
  const { analysisId } = flow;

  const [selected, setSelected] = useState('3 Months');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleContinue = async () => {
    setError('');
    setLoading(true);
    try {
      await api.saveTimeline(analysisId, selected);
      setTimeline(selected);
      navigate('/roadmap');
    } catch (err) {
      setError(err.message || 'Failed to save timeline.');
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
      <ProgressBar currentStep={3} />

      <div className="card card-wide">
        <div className="card-header">
          <h2>🗓 Choose Your Learning Timeline</h2>
          <p className="subtitle">
            How much time do you have to close your skill gaps? We'll tailor your roadmap accordingly.
          </p>
        </div>

        <div className="timeline-options">
          {TIMELINE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`timeline-${opt.value.replace(' ', '-')}`}
              type="button"
              className={`timeline-card ${selected === opt.value ? 'timeline-card-selected' : ''}`}
              style={selected === opt.value ? { borderColor: opt.color, boxShadow: `0 0 0 3px ${opt.color}30` } : {}}
              onClick={() => setSelected(opt.value)}
            >
              {opt.recommended && (
                <span className="recommended-badge">⭐ Recommended</span>
              )}
              <div className="timeline-icon" style={{ color: opt.color }}>{opt.icon}</div>
              <div className="timeline-card-title">{opt.value}</div>
              <div className="timeline-weeks" style={{ color: opt.color }}>
                {opt.weeks} weeks
              </div>
              <div className="timeline-label">{opt.label}</div>
              <p className="timeline-desc">{opt.description}</p>
              {selected === opt.value && (
                <div className="timeline-check" style={{ background: opt.color }}>✓</div>
              )}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <button
          id="btn-generate-roadmap"
          className="btn btn-primary btn-full"
          disabled={loading}
          onClick={handleContinue}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner-sm" /> Generating roadmap…
            </span>
          ) : (
            '🗺 Generate My Roadmap →'
          )}
        </button>
      </div>
    </div>
  );
};

export default TimelinePage;
