import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Send, 
  BookOpen, 
  LineChart, 
  LogOut, 
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Sidebar.css';

const Sidebar = () => {
  const { auth, logoutUser } = useApp();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/requests', icon: <Send size={20} />, label: 'Send Requests' },
    { to: '/courses', icon: <BookOpen size={20} />, label: 'Available Courses' },
    { to: '/progress', icon: <LineChart size={20} />, label: 'View Progress' },
  ];

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="mobile-brand">AI Navigator</span>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Main Sidebar */}
      <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && <h2 className="sidebar-brand">AI Career Navigator</h2>}
          <div className="sidebar-icon-brand" style={{ display: isCollapsed ? 'block' : 'none' }}>N</div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {auth.username ? auth.username.charAt(0).toUpperCase() : 'U'}
          </div>
          {!isCollapsed && <span className="user-name">{auth.username}</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={logoutUser} title={isCollapsed ? 'Logout' : undefined}>
            <span className="nav-icon"><LogOut size={20} /></span>
            {!isCollapsed && <span className="nav-label">Logout</span>}
          </button>
          
          <button 
            className="nav-item collapse-btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <span className="nav-icon"><Menu size={20} /></span>
            {!isCollapsed && <span className="nav-label">Collapse Menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
