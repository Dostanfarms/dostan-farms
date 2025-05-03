
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  resource: string;
  action: 'view' | 'create' | 'edit' | 'delete';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ resource, action }) => {
  const { currentUser, checkPermission } = useAuth();

  if (!currentUser) {
    return <Navigate to="/employee-login" replace />;
  }

  if (!checkPermission(resource, action)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
