// src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading, initializing } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - profile:', profile);
  console.log('ProtectedRoute - adminOnly:', adminOnly);
  console.log('ProtectedRoute - user role:', user?.role || profile?.role);

  // Show loading state while initializing
  if (initializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin (check both user and profile objects)
  const isAdmin = user?.role === 'admin' || profile?.role === 'admin';
  
  // Admin route but user is not admin
  if (adminOnly && !isAdmin) {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('Access granted to protected route');
  return children;
};

export default ProtectedRoute;