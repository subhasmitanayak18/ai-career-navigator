import React, { useState } from 'react';
import { UserPlus, MessageCircle, Video, Check, Clock, X } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Alice Chen', role: 'Data Scientist', skill: 'Python / ML', img: 'AC' },
  { id: 2, name: 'Bob Smith', role: 'Backend Engineer', skill: 'Go / Docker', img: 'BS' },
  { id: 3, name: 'Clara Oswald', role: 'Frontend Developer', skill: 'React / UI', img: 'CO' },
  { id: 4, name: 'David Kim', role: 'Cloud Architect', skill: 'AWS / K8s', img: 'DK' },
];

const RequestsPage = () => {
  const [connections, setConnections] = useState({});

  const handleRequest = (userId, status) => {
    setConnections(prev => ({ ...prev, [userId]: status }));
  };

  return (
    <div className="section-container">
      <h1 className="page-title">Send Requests</h1>
      <p className="page-subtitle">Connect with peers to accelerate your learning.</p>

      <div className="grid-cards">
        {mockUsers.map(user => {
          const status = connections[user.id] || 'none';

          return (
            <div key={user.id} className="card glass-panel profile-card">
              <div className="profile-header">
                <div className="profile-img">{user.img}</div>
                <div>
                  <h3 className="profile-name">{user.name}</h3>
                  <div className="profile-meta">{user.role}</div>
                </div>
              </div>
              <div className="profile-skill">
                <span className="skill-tag">{user.skill}</span>
              </div>
              
              <div className="profile-actions">
                {status === 'none' && (
                  <button className="btn btn-primary btn-full" onClick={() => handleRequest(user.id, 'pending')}>
                    <UserPlus size={16} /> Send Request
                  </button>
                )}
                
                {status === 'pending' && (
                  <div className="status-flex">
                    <span className="status-badge pending"><Clock size={14} /> Pending</span>
                    <button className="btn btn-outline btn-sm action-mock" title="Mock Accept" onClick={() => handleRequest(user.id, 'accepted')}>
                      <Check size={14} /> Simulate Accept
                    </button>
                    <button className="btn btn-outline btn-sm action-mock text-danger" title="Mock Reject" onClick={() => handleRequest(user.id, 'none')}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                {status === 'accepted' && (
                  <div className="action-row">
                    <button className="btn btn-outline action-comm"><MessageCircle size={18} /> Chat</button>
                    <button className="btn btn-primary action-comm"><Video size={18} /> Call</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <style>{`
        .section-container { display: flex; flex-direction: column; gap: 20px; }
        .page-title { color: var(--text-primary); font-size: 2rem; font-weight: 800; }
        .page-subtitle { color: var(--text-secondary); margin-bottom: 24px; }
        .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .profile-card { display: flex; flex-direction: column; gap: 16px; padding: 24px; }
        .profile-header { display: flex; align-items: center; gap: 16px; }
        .profile-img { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-300), var(--primary-500)); display: flex; justify-content: center; align-items: center; color: #fff; font-weight: bold; font-size: 1.2rem; }
        .profile-name { color: var(--text-primary); font-size: 1.1rem; font-weight: 600; }
        .profile-meta { color: var(--text-muted); font-size: 0.85rem; }
        .profile-actions { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); }
        .status-badge { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; width: fit-content; }
        .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .action-row { display: flex; gap: 12px; }
        .action-comm { flex: 1; display: flex; justify-content: center; }
        .status-flex { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .action-mock { padding: 4px 8px; font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default RequestsPage;
