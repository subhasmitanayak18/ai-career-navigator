import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';

// Pages
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage   from './pages/UploadPage';
import SkillGapPage from './pages/SkillGapPage';
import TimelinePage from './pages/TimelinePage';
import RoadmapPage  from './pages/RoadmapPage';

// Hub Pages
import RequestsPage from './pages/Hub/RequestsPage';
import CoursesPage  from './pages/Hub/CoursesPage';
import ProgressPage from './pages/Hub/ProgressPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout      from './components/Layout/AppLayout';

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
 * Checks for session restore first.
 */
const AppRoutes = () => {
  const { restoring } = useApp();

  if (restoring) {
    return (
      <div className="loading-fullpage">
        <div className="spinner spinner-lg" />
        <h3>Resuming your session...</h3>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected UI Hub Layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/requests"  element={<RequestsPage />} />
        <Route path="/courses"   element={<CoursesPage />} />
        <Route path="/progress"  element={<ProgressPage />} />
        
        {/* Core Analysis Flow routes within the Hub layout */}
        <Route path="/upload"    element={<UploadPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/timeline"  element={<TimelinePage />} />
        <Route path="/roadmap"   element={<RoadmapPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <SettingsProvider>
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  </SettingsProvider>
);

export default App;
