import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

/**
 * LoginPage — Handles both Sign In and Sign Up flows.
 * Toggles between modes via a single tab switcher.
 */
const LoginPage = () => {
  const navigate  = useNavigate();
  const { loginUser } = useApp();

  const [mode, setMode]         = useState('signin'); // 'signin' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    if (isSignup && !email.trim()) {
      setError('Email is required for sign up.');
      return;
    }

    setLoading(true);
    try {
      const data = isSignup
        ? await api.signup(username, email, password)
        : await api.login(username, password);

      loginUser(data.access_token, data.username);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Ambient gradient blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card">
        {/* Branding */}
        <div className="auth-brand">
          <div className="auth-logo">🧭</div>
          <h1 className="auth-title">AI Career Navigator</h1>
          <p className="auth-subtitle">
            Discover your skill gaps and get a personalized learning roadmap powered by AI.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="auth-tabs">
          <button
            id="tab-signin"
            className={`auth-tab ${mode === 'signin' ? 'auth-tab-active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
            type="button"
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            className={`auth-tab ${mode === 'signup' ? 'auth-tab-active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && (
            <div className="alert alert-error" role="alert">
              ⚠ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              disabled={loading}
            />
          </div>

          <button
            id="auth-submit"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-sm" /> {isSignup ? 'Creating account…' : 'Signing in…'}
              </span>
            ) : (
              isSignup ? '🚀 Create Account' : '→ Sign In'
            )}
          </button>
        </form>

        <p className="auth-footer">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            className="auth-link"
            onClick={() => { setMode(isSignup ? 'signin' : 'signup'); setError(''); }}
            type="button"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
