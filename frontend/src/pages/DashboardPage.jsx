import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

/**
 * DashboardPage — Authenticated landing page showing past analyses
 * and a CTA to start a new analysis.
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { auth, logoutUser } = useApp();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard();
        setAnalyses(data);
      } catch (err) {
        setError(err.message || 'Failed to load your analyses.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  const scoreColor = (score) => {
    const val = parseFloat(score);
    if (val >= 0.7) return '#10b981';
    if (val >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-full">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">🧭</span>
          <span className="navbar-name">AI Career Navigator</span>
        </div>
        <div className="navbar-user">
          <span className="navbar-username">👤 {auth.username}</span>
          <button id="btn-logout" className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Welcome hero */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-text">
            <h1>Welcome back, <span className="text-gradient">{auth.username}</span> 👋</h1>
            <p className="subtitle">
              Ready to close your skill gaps? Start a new analysis and get your personalized AI roadmap.
            </p>
          </div>
          <button
            id="btn-new-analysis"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/upload')}
          >
            ✦ Start New Analysis
          </button>
        </div>

        {/* Stat strip */}
        <div className="dashboard-stats">
          <div className="stat-strip-card">
            <span className="stat-strip-value">{analyses.length}</span>
            <span className="stat-strip-label">Analyses</span>
          </div>
          <div className="stat-strip-card">
            <span className="stat-strip-value">
              {analyses.filter(a => parseFloat(a.similarity_score) >= 0.7).length}
            </span>
            <span className="stat-strip-label">High Matches</span>
          </div>
          <div className="stat-strip-card">
            <span className="stat-strip-value">
              {analyses.reduce((sum, a) => sum + (a.missing_count || 0), 0)}
            </span>
            <span className="stat-strip-label">Total Skill Gaps</span>
          </div>
        </div>

        {/* Past analyses table */}
        <div className="card card-wide">
          <h2 className="card-title">📊 Past Analyses</h2>

          {loading && (
            <div className="loading-center">
              <div className="spinner" />
              <p>Loading your history…</p>
            </div>
          )}

          {error && <div className="alert alert-error">⚠ {error}</div>}

          {!loading && !error && analyses.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No analyses yet</h3>
              <p>Click "Start New Analysis" to upload your resume and discover your career roadmap.</p>
            </div>
          )}

          {!loading && analyses.length > 0 && (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Match Score</th>
                    <th>Skill Gaps</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <tr key={a.id} className="table-row">
                      <td className="td-title">{a.job_title || <span className="text-muted">Untitled</span>}</td>
                      <td>
                        <span
                          className="score-badge"
                          style={{ color: scoreColor(a.similarity_score), borderColor: scoreColor(a.similarity_score) }}
                        >
                          {a.similarity_score
                            ? `${Math.round(parseFloat(a.similarity_score) * 100)}%`
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="gap-count">
                          {a.missing_count ?? '—'} skills
                        </span>
                      </td>
                      <td className="text-muted">{formatDate(a.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
