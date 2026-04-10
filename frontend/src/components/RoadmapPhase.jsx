import React, { useState } from 'react';

const PHASE_COLORS = {
  Foundation:     { bg: '#ede9fe', text: '#6d28d9', dot: '#7c3aed' },
  Building:       { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  Specialization: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
};

const RESOURCE_ICONS = {
  Video:    '🎥',
  Article:  '📄',
  Practice: '💻',
};

/**
 * RoadmapPhase — Collapsible card for a single week of the roadmap.
 *
 * @param {{ phase: Object }} props
 *   phase.week_start  {number}
 *   phase.week_end    {number}
 *   phase.skill       {string}
 *   phase.level       {string}
 *   phase.phase       {string}  "Foundation" | "Building" | "Specialization"
 *   phase.tasks       {string[]}
 *   phase.resources   {Object[]}
 */
const RoadmapPhase = ({ phase }) => {
  const [expanded, setExpanded] = useState(false);

  const colors = PHASE_COLORS[phase.phase] || PHASE_COLORS.Foundation;
  const weekLabel =
    phase.week_start === phase.week_end
      ? `Week ${phase.week_start}`
      : `Weeks ${phase.week_start}–${phase.week_end}`;

  return (
    <div className="phase-card">
      {/* ── Header ─────────────────────────────────────────────── */}
      <button
        className="phase-header"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        {/* Left: Week badge + skill info */}
        <div className="phase-header-left">
          <span className="week-badge">{weekLabel}</span>
          <div className="phase-skill-info">
            <span className="phase-skill-name">{phase.skill}</span>
            <span
              className="level-pill"
              style={{ background: colors.bg, color: colors.text }}
            >
              <span
                className="level-dot"
                style={{ background: colors.dot }}
              />
              {phase.level}
            </span>
          </div>
        </div>

        {/* Right: Phase label + chevron */}
        <div className="phase-header-right">
          <span
            className="phase-badge"
            style={{ background: colors.bg, color: colors.text }}
          >
            {phase.phase}
          </span>
          <span className={`phase-chevron ${expanded ? 'chevron-up' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* ── Expanded body ───────────────────────────────────────── */}
      {expanded && (
        <div className="phase-body">
          {/* Tasks */}
          <div className="phase-section">
            <h4 className="phase-section-title">📋 Weekly Tasks</h4>
            <ul className="task-list">
              {phase.tasks.map((task, i) => (
                <li key={i} className="task-item">
                  <span className="task-bullet">✓</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          {phase.resources && phase.resources.length > 0 && (
            <div className="phase-section">
              <h4 className="phase-section-title">🔗 Learning Resources</h4>
              <div className="resources-list">
                {phase.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-item"
                  >
                    <span className="resource-icon">
                      {RESOURCE_ICONS[res.type] || '📚'}
                    </span>
                    <div className="resource-info">
                      <span className="resource-title">{res.title}</span>
                      <span className="resource-meta">
                        {res.platform} · {res.duration} · {res.type}
                      </span>
                    </div>
                    <span className="resource-arrow">→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapPhase;
