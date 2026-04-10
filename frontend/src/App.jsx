import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Pages
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage   from './pages/UploadPage';
import SkillGapPage from './pages/SkillGapPage';
import TimelinePage from './pages/TimelinePage';
import RoadmapPage  from './pages/RoadmapPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Global styles
import './styles/global.css';

/**
 * Root redirect: send authenticated users to /dashboard, others to /login.
 */
const RootRedirect = () => {
  const { auth } = useApp();
  return <Navigate to={auth.token ? '/dashboard' : '/login'} replace />;
};

/**
 * Application routing.
 * Wrapped in AppProvider so all routes can access global state.
 */
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"      element={<RootRedirect />} />
    <Route path="/login" element={<LoginPage />} />

    {/* Protected */}
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
    <Route path="/skill-gap" element={<ProtectedRoute><SkillGapPage /></ProtectedRoute>} />
    <Route path="/timeline"  element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
    <Route path="/roadmap"   element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </BrowserRouter>
);

export default App;
