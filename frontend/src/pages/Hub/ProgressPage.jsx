import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const skillData = [
  { month: 'Jan', python: 20, react: 10, docker: 0 },
  { month: 'Feb', python: 35, react: 25, docker: 5 },
  { month: 'Mar', python: 45, react: 40, docker: 15 },
  { month: 'Apr', python: 60, react: 55, docker: 30 },
  { month: 'May', python: 75, react: 65, docker: 45 },
  { month: 'Jun', python: 85, react: 80, docker: 60 },
];

const CircularProgress = ({ percentage, color, label }) => {
  const sqSize = 120;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - dashArray * percentage / 100;

  return (
    <div className="circular-wrap">
      <svg width={sqSize} height={sqSize} viewBox={viewBox}>
        <circle
          className="circle-background"
          cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={strokeWidth}
        />
        <circle
          className="circle-progress"
          cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={strokeWidth}
          style={{
            strokeDasharray: dashArray,
            strokeDashoffset: dashOffset,
            stroke: color
          }}
          transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
        />
        <text className="circle-text" x="50%" y="50%" dy=".3em" textAnchor="middle">
          {percentage}%
        </text>
      </svg>
      <div className="circle-label">{label}</div>
    </div>
  );
};

const ProgressPage = () => {
  return (
    <div className="section-container">
      <h1 className="page-title">Learning Progress</h1>
      <p className="page-subtitle">Track your skill acquisition and course completion.</p>

      {/* Top Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-panel">
          <span className="stat-value text-gradient">68%</span>
          <span className="stat-label">Overall Completion</span>
          <div className="linear-progress-bg mt-3">
            <div className="linear-progress-fill" style={{ width: '68%' }} />
          </div>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-value" style={{ color: 'var(--success-500)' }}>14</span>
          <span className="stat-label">Day Streak 🔥</span>
        </div>
        <div className="stat-card glass-panel">
          <span className="stat-value" style={{ color: 'var(--warning-500)' }}>42h</span>
          <span className="stat-label">Learning Time</span>
        </div>
      </div>

      <div className="progress-split">
        {/* Chart Area */}
        <div className="chart-section glass-panel">
          <h3>Skill Growth Over Time</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={skillData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success-500)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="python" name="Python" stroke="var(--primary-500)" fillOpacity={1} fill="url(#colorPy)" />
                <Area type="monotone" dataKey="react" name="React" stroke="var(--success-500)" fillOpacity={1} fill="url(#colorRe)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Indicators */}
        <div className="circles-section glass-panel">
          <h3>Course Status</h3>
          <div className="circles-grid">
            <CircularProgress percentage={100} color="var(--success-500)" label="HTML/CSS Basics" />
            <CircularProgress percentage={65} color="var(--primary-500)" label="React Patterns" />
            <CircularProgress percentage={30} color="var(--warning-500)" label="Docker Arrays" />
            <CircularProgress percentage={0} color="var(--gray-500)" label="K8s Advanced" />
          </div>
        </div>
      </div>

      <style>{`
        .progress-split { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        @media(max-width: 1024px) { .progress-split { grid-template-columns: 1fr; } }
        
        .chart-section, .circles-section { padding: 24px; border-radius: var(--radius-lg); }
        .chart-section h3, .circles-section h3 { color: var(--text-primary); margin-bottom: 20px; font-weight: 600; }
        
        .chart-wrapper { height: 300px; width: 100%; }
        
        .linear-progress-bg { width: 100%; height: 6px; background: rgba(150,150,150,0.2); border-radius: 4px; overflow: hidden; }
        .linear-progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary-500), var(--primary-300)); border-radius: 4px; }
        .mt-3 { margin-top: 12px; }

        .circles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .circular-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .circle-background { fill: none; stroke: rgba(150,150,150,0.1); }
        .circle-progress { fill: none; stroke-linecap: round; transition: stroke-dashoffset 1s ease-out; }
        .circle-text { fill: var(--text-primary); font-size: 1.5rem; font-weight: 700; }
        .circle-label { color: var(--text-secondary); font-size: 0.85rem; text-align: center; }
      `}</style>
    </div>
  );
};

export default ProgressPage;
