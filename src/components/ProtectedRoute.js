import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Show a loading state
  if (!user) return <Navigate to="/login" replace />; // Redirect to login if not authenticated

  return children; // Render protected content
};

export default ProtectedRoute;
