import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token } = useAuth();

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not the right role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access wrong route
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    }
    // Fallback
    return <Navigate to="/" replace />;
  }

  // Allowed
  return <Outlet />;
};

export default ProtectedRoute;
