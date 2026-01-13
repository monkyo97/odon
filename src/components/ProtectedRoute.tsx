import React, { ReactNode, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const hasRenderedRef = useRef(false);

  // ⏳ 1. Wait for AuthProvider to load initial session
  if (isLoading && !hasRenderedRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 🚫 2. User not authenticated: redirect to login
  if (!user && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 3. User authenticated: render and mark as rendered once
  if (user && !hasRenderedRef.current) {
    hasRenderedRef.current = true;
  }

  return <>{children}</>;
};
