import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRouteByRole } from "../../config/routes";
import LoadingSpiner from "../../LoadingSpiner";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, userSynced, isLoggedIn, authInitializing } = useAuth();

  if (authInitializing || !userSynced) {
    return <LoadingSpiner />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    return <LoadingSpiner />;
  }

  if (window.location.pathname === "/") {
    return <Outlet />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRouteByRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
