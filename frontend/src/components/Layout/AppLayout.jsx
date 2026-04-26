import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSettings } from '../../context/SettingsContext';
import { Moon, Sun, Globe } from 'lucide-react';

const AppLayout = () => {
  const { theme, toggleTheme, language, setLanguage } = useSettings();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-right">
            <button className="topbar-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="topbar-dropdown">
              <Globe size={20} className="globe-icon" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="topbar-select"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
                <option value="de">DE</option>
              </select>
            </div>
          </div>
        </header>

        <div className="content-container">
          <Outlet />
        </div>
      </main>

      <style>{`
        .topbar {
          display: flex;
          justify-content: flex-end;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 24px;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .topbar-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: var(--radius-sm);
        }
        .topbar-btn:hover { background: rgba(150,150,150,0.1); }
        .topbar-dropdown {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
          background: rgba(150,150,150,0.05);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        .topbar-select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
          font-weight: 500;
        }
        .topbar-select option {
          background: var(--bg-card);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
