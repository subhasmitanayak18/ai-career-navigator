import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

/**
 * UploadPage — Step 1 of the analysis wizard.
 * Lets users paste resume text OR upload a PDF, enter a job description,
 * and submits to the /api/analyze/ endpoint.
 */
const UploadPage = () => {
  const navigate = useNavigate();
  const { setAnalysisResult } = useApp();

  const [jobTitle, setJobTitle]             = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeMode, setResumeMode]         = useState('text'); // 'text' | 'file'
  const [resumeText, setResumeText]         = useState('');
  const [resumeFile, setResumeFile]         = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    setResumeFile(file || null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!jobDescription.trim()) {
      setError('Job description is required.');
      return;
    }
    if (resumeMode === 'text' && !resumeText.trim()) {
      setError('Please paste your resume text.');
      return;
    }
    if (resumeMode === 'file' && !resumeFile) {
      setError('Please upload a PDF resume.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (jobTitle.trim()) formData.append('job_title', jobTitle.trim());
      formData.append('job_description', jobDescription.trim());

      if (resumeMode === 'text') {
        formData.append('resume_text', resumeText.trim());
      } else {
        formData.append('resume_file', resumeFile);
      }

      const data = await api.analyze(formData);
      setAnalysisResult(data);
      navigate('/skill-gap');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <ProgressBar currentStep={1} />

      <div className="card card-wide">
        <div className="card-header">
          <h2>📄 Upload Your Resume</h2>
          <p className="subtitle">Let BERT analyze your skills against the job description.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-error">⚠ {error}</div>}

          {/* Job Title */}
          <div className="form-group">
            <label htmlFor="job-title">Job Title <span className="optional">(optional)</span></label>
            <input
              id="job-title"
              type="text"
              placeholder="e.g. Senior Backend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Resume toggle */}
          <div className="form-group">
            <label>Resume Input</label>
            <div className="toggle-tabs">
              <button
                id="btn-resume-text"
                type="button"
                className={`toggle-tab ${resumeMode === 'text' ? 'active' : ''}`}
                onClick={() => setResumeMode('text')}
                disabled={loading}
              >
                📝 Paste Text
              </button>
              <button
                id="btn-resume-file"
                type="button"
                className={`toggle-tab ${resumeMode === 'file' ? 'active' : ''}`}
                onClick={() => setResumeMode('file')}
                disabled={loading}
              >
                📎 Upload PDF
              </button>
            </div>

            {resumeMode === 'text' ? (
              <textarea
                id="resume-text"
                rows={10}
                placeholder="Paste your full resume text here…"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={loading}
              />
            ) : (
              <div className="file-drop-zone">
                <input
                  id="resume-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="file-input"
                />
                <label htmlFor="resume-file" className="file-drop-label">
                  {resumeFile ? (
                    <span className="file-name">✅ {resumeFile.name}</span>
                  ) : (
                    <>
                      <span className="file-icon">📁</span>
                      <span>Click to browse or drag & drop your PDF</span>
                      <span className="file-hint">Max size: 10 MB</span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="form-group">
            <label htmlFor="job-description">Job Description *</label>
            <textarea
              id="job-description"
              rows={8}
              placeholder="Paste the full job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            id="btn-analyze"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-sm" /> BERT is analyzing…
              </span>
            ) : (
              '🔍 Analyze My Resume →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;
