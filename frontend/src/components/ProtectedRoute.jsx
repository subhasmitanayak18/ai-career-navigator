import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * ProtectedRoute — Guards routes that require authentication.
 *
 * If the user is not logged in (no JWT token in context/localStorage),
 * they are redirected to /login. Otherwise, the children are rendered.
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
  const { auth } = useApp();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
