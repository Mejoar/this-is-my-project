import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

// AdminRoute now enforces proper role-based access control
const AdminRoute: React.FC<AdminRouteProps> = ({ children, requiredRole = 'admin' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  const hasRequiredRole = () => {
    if (requiredRole === 'super_admin') {
      return user.role === 'super_admin';
    }
    // For admin routes, allow both admin and super_admin
    return user.role === 'admin' || user.role === 'super_admin';
  };

  if (!hasRequiredRole()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Required role: {requiredRole}</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;

